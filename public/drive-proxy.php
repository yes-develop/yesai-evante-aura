<?php
// Proxy to serve Google Drive files and resolve filenames
header('Access-Control-Allow-Origin: *');

$id = isset($_GET['id']) ? trim($_GET['id']) : null;
$type = isset($_GET['type']) ? trim($_GET['type']) : 'thumbnail'; // 'thumbnail', 'dl', or 'filename'

if (!$id) {
    http_response_code(400);
    die('ID is required');
}

// ─── Shared helper: resolve real filename from Drive headers ─────────────────
function cleanFilename(?string $filename): ?string
{
    if (!$filename)
        return null;

    // 1. ตัดส่วนที่ขึ้นต้นด้วย LINE_ จนถึงชุดตัวเลขหรืออักษรยาวๆ ที่คั่นด้วย underscore
    $cleaned = $filename;

    // ตัด LINE_ID และเลขชุดที่คั่นด้วย underscore
    $cleaned = preg_replace('/^LINE_[a-z0-9]+(_[a-z0-9]+)*[-_]/i', '', $cleaned);

    // 2. ถ้ายังมี timestamp ตัวเลขยาวๆ (10 หลักขึ้นไป) นำหน้า ให้ตัดออก
    $cleaned = preg_replace('/^\d{10,}_/', '', $cleaned);

    return $cleaned ?: $filename;
}

function resolveGoogleDriveFilename(string $id): ?string
{
    $dlUrl = 'https://drive.google.com/uc?export=download&id=' . urlencode($id);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $dlUrl);
    curl_setopt($ch, CURLOPT_NOBODY, true); // HEAD-like – no body
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_USERAGENT,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' .
        '(KHTML, like Gecko) Chrome/120 Safari/537.36');
    $headerData = curl_exec($ch);
    curl_close($ch);

    if (!$headerData) {
        return null;
    }

    // 1. Content-Disposition: attachment; filename="foo.pdf"
    //    also handles filename*=UTF-8''foo%20bar.pdf  (RFC 5987)
    if (preg_match('/Content-Disposition:.*filename\*\s*=\s*(?:UTF-8\'\')?([^\s;]+)/i', $headerData, $m)) {
        $name = rawurldecode(trim($m[1], '"\''));
        if ($name !== '')
            return $name;
    }
    if (preg_match('/Content-Disposition:.*filename\s*=\s*(["\']?)([^"\';\r\n]+)\1/i', $headerData, $m)) {
        $name = trim($m[2], '"\'');
        if ($name !== '')
            return $name;
    }

    // 2. X-Content-Filename header (sometimes present)
    if (preg_match('/X-Content-Filename:\s*(.+)/i', $headerData, $m)) {
        $name = trim($m[1]);
        if ($name !== '')
            return $name;
    }

    // 3. Last Location redirect URL – look for a path segment with an extension
    if (preg_match_all('/Location:\s*(https?:\/\/\S+)/i', $headerData, $ms)) {
        foreach (array_reverse($ms[1]) as $loc) {
            $path = parse_url(trim($loc), PHP_URL_PATH);
            if ($path) {
                $candidate = rawurldecode(basename($path));
                if ($candidate !== '' && strpos($candidate, '.') !== false) {
                    return $candidate;
                }
            }
        }
    }

    return null;
}

// ─── Resolve filename (JSON endpoint) ────────────────────────────────────────
if ($type === 'filename') {
    header('Content-Type: application/json');
    $filename = resolveGoogleDriveFilename($id);
    echo json_encode(['id' => $id, 'filename' => cleanFilename($filename)]);
    exit;
}

// ─── Thumbnail ────────────────────────────────────────────────────────────────
if ($type === 'thumbnail') {
    $url = 'https://drive.google.com/thumbnail?id=' . urlencode($id) . '&sz=w1000';
    header('Content-Type: image/jpeg');

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_USERAGENT,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' .
        '(KHTML, like Gecko) Chrome/120 Safari/537.36');
    curl_exec($ch);
    curl_close($ch);
    exit;
}

// ─── Download (type=dl) ───────────────────────────────────────────────────────
// Resolve the real filename (with extension) first, then stream the file
$realName = resolveGoogleDriveFilename($id);
$realName = cleanFilename($realName);
if (!$realName) {
    $realName = 'file'; // absolute last resort
}

// Sanitize: remove path traversal characters
$safeFilename = basename(str_replace(['/', '\\', '..'], '_', $realName));
if ($safeFilename === '' || $safeFilename === '.') {
    $safeFilename = 'file';
}

// Encode for Content-Disposition (RFC 5987 – supports unicode filenames)
$encodedFilename = rawurlencode($safeFilename);

header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $safeFilename . '"; filename*=UTF-8\'\'' . $encodedFilename);
header('Content-Transfer-Encoding: binary');
header('Cache-Control: no-cache, must-revalidate');

// Stream the actual file
$dlUrl = 'https://drive.google.com/uc?export=download&id=' . urlencode($id);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $dlUrl);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, false); // stream directly
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' .
    '(KHTML, like Gecko) Chrome/120 Safari/537.36');
curl_exec($ch);
curl_close($ch);
