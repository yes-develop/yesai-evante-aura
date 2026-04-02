<?php

namespace Database\Seeders;

use App\Models\CallLog;
use App\Models\CallTranscript;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class MockCallLogSeeder extends Seeder
{
    public function run(): void
    {
        $scenarios = [
            [
                'customer_name' => 'สมชาย วงศ์ดี',
                'phone_number'  => '+66812345678',
                'direction'     => 'inbound',
                'status'        => 'completed',
                'duration_seconds' => 487,
                'sentiment'     => 'positive',
                'summary'       => 'ลูกค้าสอบถามห้องพักประเภท Deluxe สำหรับคืนวันที่ 5-7 เมษายน ราคาและสิ่งอำนวยความสะดวก AI แจ้งรายละเอียดและเสนอการจองได้สำเร็จ',
                'topic'         => 'room_inquiry',
                'messages'      => [
                    ['speaker' => 'ai',    'content' => 'สวัสดีครับ นี่คือ SONA ผู้ช่วย AI ของโรงแรม Evante มีอะไรให้ช่วยได้บ้างครับ'],
                    ['speaker' => 'human', 'content' => 'สวัสดีครับ อยากสอบถามเรื่องห้องพักครับ'],
                    ['speaker' => 'ai',    'content' => 'ยินดีช่วยเลยครับ อยากทราบเรื่องอะไรเป็นพิเศษไหมครับ เช่น ประเภทห้อง ราคา หรือวันที่เข้าพัก'],
                    ['speaker' => 'human', 'content' => 'มีห้อง Deluxe ว่างช่วง 5-7 เมษาไหมครับ'],
                    ['speaker' => 'ai',    'content' => 'ช่วง 5-7 เมษายน ห้อง Deluxe ยังมีว่างอยู่ครับ ราคา 3,500 บาทต่อคืน มี 2 ท่านไหมครับ'],
                    ['speaker' => 'human', 'content' => 'ใช่ครับ 2 ท่าน มีอะไรรวมบ้างครับ'],
                    ['speaker' => 'ai',    'content' => 'รวมอาหารเช้า 2 ท่าน สระว่ายน้ำฟรี และ Wi-Fi ความเร็วสูงครับ ต้องการจองเลยไหมครับ'],
                    ['speaker' => 'human', 'content' => 'โอเคครับ จองเลยได้เลย ชื่อสมชาย วงศ์ดี ครับ'],
                    ['speaker' => 'ai',    'content' => 'รับทราบครับ คุณสมชาย ผมได้บันทึกการจองไว้แล้วนะครับ ทางโรงแรมจะส่ง confirmation ไปทาง email ครับ'],
                    ['speaker' => 'human', 'content' => 'ขอบคุณมากครับ'],
                    ['speaker' => 'ai',    'content' => 'ด้วยความยินดีครับ ขอบคุณที่ใช้บริการ Evante Hotel ครับ'],
                ],
            ],
            [
                'customer_name' => 'Katrina Smith',
                'phone_number'  => '+66891234567',
                'direction'     => 'inbound',
                'status'        => 'completed',
                'duration_seconds' => 312,
                'sentiment'     => 'positive',
                'summary'       => 'Customer called to schedule a room viewing for the Executive Suite. AI confirmed appointment for April 10th at 2PM.',
                'topic'         => 'appointment',
                'messages'      => [
                    ['speaker' => 'ai',    'content' => 'Hello, this is SONA, Evante Hotel AI assistant. How may I help you today?'],
                    ['speaker' => 'human', 'content' => 'Hi, I\'d like to schedule a room viewing please.'],
                    ['speaker' => 'ai',    'content' => 'Of course! Which room type are you interested in viewing?'],
                    ['speaker' => 'human', 'content' => 'The Executive Suite, I saw it on your website.'],
                    ['speaker' => 'ai',    'content' => 'Excellent choice! We have availability for viewings on April 10th. Would 2PM work for you?'],
                    ['speaker' => 'human', 'content' => 'Yes, 2PM on April 10th works perfectly.'],
                    ['speaker' => 'ai',    'content' => 'Wonderful! I\'ve scheduled a viewing of the Executive Suite for April 10th at 2PM. Could I get your name please?'],
                    ['speaker' => 'human', 'content' => 'Katrina Smith.'],
                    ['speaker' => 'ai',    'content' => 'Thank you Katrina! Your viewing is confirmed. Our concierge will meet you at the lobby. Is there anything else I can help you with?'],
                    ['speaker' => 'human', 'content' => 'No, that\'s all. Thank you!'],
                    ['speaker' => 'ai',    'content' => 'You\'re welcome! See you on April 10th. Have a great day!'],
                ],
            ],
            [
                'customer_name' => 'วิชัย มีสุข',
                'phone_number'  => '+66856789012',
                'direction'     => 'inbound',
                'status'        => 'completed',
                'duration_seconds' => 628,
                'sentiment'     => 'negative',
                'summary'       => 'ลูกค้าร้องเรียนเรื่องเสียงรบกวนจากห้องข้างเคียงเมื่อคืนวานนี้ ทำให้นอนไม่หลับ AI รับเรื่องและแจ้งว่าจะโอนเรื่องให้ฝ่ายบริการลูกค้าดำเนินการ',
                'topic'         => 'complaint',
                'messages'      => [
                    ['speaker' => 'ai',    'content' => 'สวัสดีครับ SONA ผู้ช่วย AI ของโรงแรม Evante มีอะไรให้ช่วยได้บ้างครับ'],
                    ['speaker' => 'human', 'content' => 'ผมอยากร้องเรียนเรื่องห้องพักครับ'],
                    ['speaker' => 'ai',    'content' => 'รับทราบครับ กรุณาบอกรายละเอียดได้เลยครับ'],
                    ['speaker' => 'human', 'content' => 'เมื่อคืนมีเสียงดังมากจากห้องข้างๆ นอนไม่หลับเลยครับ'],
                    ['speaker' => 'ai',    'content' => 'ขออภัยอย่างมากครับ คุณวิชัย ทางโรงแรมเราเข้าใจว่านั่นเป็นประสบการณ์ที่ไม่ดีมากครับ ขณะนี้คุณยังพักอยู่กับเราไหมครับ'],
                    ['speaker' => 'human', 'content' => 'อยู่ครับ ห้อง 304'],
                    ['speaker' => 'ai',    'content' => 'ขอบคุณครับ ผมจะบันทึกเรื่องร้องเรียนนี้และโอนให้ฝ่ายบริการลูกค้าติดต่อกลับภายใน 30 นาทีครับ ต้องการให้เปลี่ยนห้องไหมครับ'],
                    ['speaker' => 'human', 'content' => 'ถ้าเปลี่ยนได้ก็ดีครับ'],
                    ['speaker' => 'ai',    'content' => 'รับทราบครับ ผมจะแจ้งให้ทีมงานดำเนินการเรื่องห้องให้ทันทีครับ อีกครั้งขออภัยในความไม่สะดวกครับ'],
                ],
            ],
            [
                'customer_name' => 'นภา รุ่งเรือง',
                'phone_number'  => '+66823456789',
                'direction'     => 'outbound',
                'status'        => 'completed',
                'duration_seconds' => 245,
                'sentiment'     => 'positive',
                'summary'       => 'โทรออกเพื่อ follow up การจองที่พักของลูกค้า ยืนยันรายละเอียดการเช็คอินและบริการพิเศษที่ขอไว้',
                'topic'         => 'follow_up',
                'messages'      => [
                    ['speaker' => 'ai',    'content' => 'สวัสดีครับ คุณนภา นี่คือ SONA จากโรงแรม Evante โทรมาเพื่อยืนยันการจองของคุณครับ'],
                    ['speaker' => 'human', 'content' => 'สวัสดีค่ะ ใช่เลยค่ะ'],
                    ['speaker' => 'ai',    'content' => 'การจองของคุณสำหรับวันที่ 15 เมษายน ห้อง Superior Twin 2 คืน ถูกต้องไหมครับ'],
                    ['speaker' => 'human', 'content' => 'ถูกต้องค่ะ มีบริการรับส่งสนามบินด้วยไหมคะ'],
                    ['speaker' => 'ai',    'content' => 'มีครับ บริการรับส่งสนามบินราคา 800 บาท ต้องการเพิ่มไหมครับ แจ้งเที่ยวบินมาได้เลย'],
                    ['speaker' => 'human', 'content' => 'เพิ่มเลยค่ะ เที่ยวบิน TG302 ถึง 14:30 น.'],
                    ['speaker' => 'ai',    'content' => 'บันทึกแล้วครับ รถจะไปรอที่ TG302 เวลา 14:30 น. ขอบคุณครับ คุณนภา'],
                ],
            ],
            [
                'customer_name' => 'Barry Johnson',
                'phone_number'  => '+66834567890',
                'direction'     => 'inbound',
                'status'        => 'no-answer',
                'duration_seconds' => 0,
                'sentiment'     => null,
                'summary'       => null,
                'topic'         => 'missed',
                'messages'      => [],
            ],
            [
                'customer_name' => 'OHM Nakorn',
                'phone_number'  => '+66845678901',
                'direction'     => 'inbound',
                'status'        => 'completed',
                'duration_seconds' => 193,
                'sentiment'     => 'neutral',
                'summary'       => 'ลูกค้าสอบถามรายละเอียดบิลค่าที่พักและขอใบเสร็จอิเล็กทรอนิกส์ AI แจ้งขั้นตอนและส่ง link ให้ทาง email',
                'topic'         => 'billing',
                'messages'      => [
                    ['speaker' => 'ai',    'content' => 'สวัสดีครับ SONA Evante Hotel ครับ'],
                    ['speaker' => 'human', 'content' => 'สวัสดีครับ อยากขอใบเสร็จสำหรับการเข้าพักเมื่ออาทิตย์ก่อนครับ'],
                    ['speaker' => 'ai',    'content' => 'ได้เลยครับ ช่วยบอกชื่อหรือหมายเลขการจองได้ไหมครับ'],
                    ['speaker' => 'human', 'content' => 'ชื่อ OHM Nakorn ครับ จองวันที่ 10-12 มีนา'],
                    ['speaker' => 'ai',    'content' => 'เจอแล้วครับ การจอง 2 คืน ห้อง Deluxe ทั้งหมด 7,500 บาท ต้องการใบเสร็จส่งทาง email ไหมครับ'],
                    ['speaker' => 'human', 'content' => 'ได้เลยครับ ohm@example.com'],
                    ['speaker' => 'ai',    'content' => 'ส่งใบเสร็จไปที่ ohm@example.com แล้วครับ กรุณาตรวจสอบ inbox ครับ'],
                    ['speaker' => 'human', 'content' => 'ขอบคุณครับ'],
                ],
            ],
            [
                'customer_name' => 'Boat Sirirak',
                'phone_number'  => '+66867890123',
                'direction'     => 'inbound',
                'status'        => 'completed',
                'duration_seconds' => 341,
                'sentiment'     => 'positive',
                'summary'       => 'ลูกค้าสอบถามเรื่องการจัดงานแต่งงานในโรงแรม AI ให้ข้อมูลห้องจัดงาน ราคาแพ็กเกจ และนัดพูดคุยกับทีม Event',
                'topic'         => 'event',
                'messages'      => [
                    ['speaker' => 'ai',    'content' => 'สวัสดีครับ SONA Evante Hotel ยินดีต้อนรับครับ'],
                    ['speaker' => 'human', 'content' => 'สวัสดีครับ อยากสอบถามเรื่องจัดงานแต่งงานครับ'],
                    ['speaker' => 'ai',    'content' => 'ยินดีให้ข้อมูลครับ โรงแรม Evante มีห้องบอลรูมรับได้ถึง 300 คน และสวนกลางแจ้งรับได้ 150 คนครับ'],
                    ['speaker' => 'human', 'content' => 'แพ็กเกจราคาเท่าไหร่ครับ'],
                    ['speaker' => 'ai',    'content' => 'แพ็กเกจเริ่มต้นที่ 150,000 บาท รวมอาหาร เครื่องดื่ม และการตกแต่งพื้นฐานครับ มีแพ็กเกจ Premium และ Luxury ด้วยครับ'],
                    ['speaker' => 'human', 'content' => 'อยากนัดคุยกับทีมงานครับ'],
                    ['speaker' => 'ai',    'content' => 'ผมจะนัดให้ทีม Event Coordinator ติดต่อกลับภายใน 1 ชั่วโมงครับ วันไหนสะดวกครับ'],
                    ['speaker' => 'human', 'content' => 'พรุ่งนี้บ่ายได้เลยครับ'],
                    ['speaker' => 'ai',    'content' => 'บันทึกแล้วครับ ทีมงานจะโทรหาพรุ่งนี้ช่วงบ่ายครับ ขอบคุณที่สนใจครับ'],
                ],
            ],
            [
                'customer_name' => 'มานพ ใจดี',
                'phone_number'  => '+66878901234',
                'direction'     => 'outbound',
                'status'        => 'completed',
                'duration_seconds' => 156,
                'sentiment'     => 'neutral',
                'summary'       => 'โทรออกเพื่อแจ้ง early check-in policy และสอบถามเวลาเดินทางของลูกค้า',
                'topic'         => 'follow_up',
                'messages'      => [
                    ['speaker' => 'ai',    'content' => 'สวัสดีครับ คุณมานพ นี่คือ SONA จาก Evante Hotel ครับ'],
                    ['speaker' => 'human', 'content' => 'สวัสดีครับ'],
                    ['speaker' => 'ai',    'content' => 'โทรมาแจ้งว่า Early Check-in ของคุณวันพรุ่งนี้ พร้อมให้บริการตั้งแต่ 10:00 น. ครับ'],
                    ['speaker' => 'human', 'content' => 'โอเคครับ คาดว่าจะถึงประมาณ 11 โมงครับ'],
                    ['speaker' => 'ai',    'content' => 'รับทราบครับ ทางโรงแรมจะเตรียมห้องให้พร้อมครับ ขอบคุณครับ'],
                ],
            ],
            [
                'customer_name' => 'Alice Wong',
                'phone_number'  => '+66889012345',
                'direction'     => 'inbound',
                'status'        => 'failed',
                'duration_seconds' => 12,
                'sentiment'     => null,
                'summary'       => null,
                'topic'         => 'failed',
                'messages'      => [
                    ['speaker' => 'ai',    'content' => 'Hello, this is SONA, Evante Hotel AI assistant.'],
                    ['speaker' => 'system', 'content' => 'Call connection dropped unexpectedly.'],
                ],
            ],
            [
                'customer_name' => 'สุดา พรหมสุข',
                'phone_number'  => '+66890123456',
                'direction'     => 'inbound',
                'status'        => 'completed',
                'duration_seconds' => 418,
                'sentiment'     => 'positive',
                'summary'       => 'ลูกค้าสอบถามเรื่อง Spa package และต้องการจองนวดแผนไทย 2 ชั่วโมง AI แนะนำ package และจองให้เรียบร้อย',
                'topic'         => 'spa',
                'messages'      => [
                    ['speaker' => 'ai',    'content' => 'สวัสดีครับ SONA Evante Hotel ครับ'],
                    ['speaker' => 'human', 'content' => 'สวัสดีค่ะ อยากสอบถาม Spa ค่ะ'],
                    ['speaker' => 'ai',    'content' => 'ยินดีครับ Evante Spa มีบริการนวดหลายประเภทครับ สนใจแบบไหนครับ'],
                    ['speaker' => 'human', 'content' => 'นวดแผนไทย 2 ชั่วโมงมีไหมคะ'],
                    ['speaker' => 'ai',    'content' => 'มีครับ นวดแผนไทย 2 ชั่วโมง ราคา 2,400 บาท รวมน้ำชาสมุนไพรและผ้าเย็นครับ'],
                    ['speaker' => 'human', 'content' => 'วันพรุ่งนี้มีว่างไหมคะ ช่วงบ่าย'],
                    ['speaker' => 'ai',    'content' => 'พรุ่งนี้มีว่าง 14:00 และ 15:30 น. ครับ สะดวกเวลาไหนครับ'],
                    ['speaker' => 'human', 'content' => 'ขอ 14:00 น. ค่ะ ชื่อสุดา ห้อง 208 ค่ะ'],
                    ['speaker' => 'ai',    'content' => 'จองแล้วครับ คุณสุดา ห้อง 208 นวดแผนไทย 2 ชั่วโมง พรุ่งนี้ 14:00 น. ยืนยันนะครับ'],
                    ['speaker' => 'human', 'content' => 'ขอบคุณมากค่ะ'],
                    ['speaker' => 'ai',    'content' => 'ด้วยความยินดีครับ พบกันพรุ่งนี้ครับ'],
                ],
            ],
            [
                'customer_name' => 'BigZ Tanaka',
                'phone_number'  => '+66801234567',
                'direction'     => 'inbound',
                'status'        => 'completed',
                'duration_seconds' => 272,
                'sentiment'     => 'neutral',
                'summary'       => 'Guest inquired about late checkout policy and restaurant operating hours. AI provided all requested information.',
                'topic'         => 'room_inquiry',
                'messages'      => [
                    ['speaker' => 'ai',    'content' => 'Hello, SONA from Evante Hotel. How can I assist you?'],
                    ['speaker' => 'human', 'content' => 'Hi, what time is checkout and can I get a late checkout?'],
                    ['speaker' => 'ai',    'content' => 'Standard checkout is at 12PM. Late checkout until 2PM is available for 500 THB, and until 6PM for 1,500 THB, subject to availability.'],
                    ['speaker' => 'human', 'content' => 'And what about the restaurant hours?'],
                    ['speaker' => 'ai',    'content' => 'Our main restaurant is open from 6:30AM to 10:30PM daily. Room service is available 24 hours.'],
                    ['speaker' => 'human', 'content' => 'Great, I\'ll think about the late checkout. Thanks.'],
                    ['speaker' => 'ai',    'content' => 'Of course! Just let us know before 10AM if you\'d like to arrange it. Have a wonderful stay!'],
                ],
            ],
        ];

        $baseTime = Carbon::now()->subDays(14);

        foreach ($scenarios as $index => $scenario) {
            $startedAt = $baseTime->copy()->addDays($index)->addHours(rand(8, 20))->addMinutes(rand(0, 59));
            $endedAt   = $scenario['status'] === 'completed'
                ? $startedAt->copy()->addSeconds($scenario['duration_seconds'])
                : null;

            $call = CallLog::create([
                'vapi_call_id'     => 'mock_' . strtolower(str_replace(' ', '_', $scenario['customer_name'])) . '_' . $index,
                'phone_number'     => $scenario['phone_number'],
                'direction'        => $scenario['direction'],
                'status'           => $scenario['status'],
                'duration_seconds' => $scenario['duration_seconds'] ?: null,
                'started_at'       => $startedAt,
                'ended_at'         => $endedAt,
                'assistant_id'     => config('services.vapi.assistant_id', 'asst_mock_evante'),
                'customer_name'    => $scenario['customer_name'],
                'summary'          => $scenario['summary'],
                'sentiment'        => $scenario['sentiment'],
                'recording_url'    => $scenario['status'] === 'completed'
                    ? 'https://storage.vapi.ai/recordings/mock_' . $index . '.mp3'
                    : null,
                'cost'             => $scenario['status'] === 'completed'
                    ? round($scenario['duration_seconds'] * 0.0007, 4)
                    : null,
                'metadata'         => ['topic' => $scenario['topic']],
            ]);

            $tsMs = 0;
            foreach ($scenario['messages'] as $msg) {
                CallTranscript::create([
                    'call_log_id'  => $call->id,
                    'speaker'      => $msg['speaker'],
                    'content'      => $msg['content'],
                    'timestamp_ms' => $tsMs,
                    'is_final'     => true,
                    'confidence'   => $msg['speaker'] === 'human' ? round(rand(88, 99) / 100, 2) : null,
                ]);
                $tsMs += rand(3000, 12000);
            }
        }

        $this->command->info('MockCallLogSeeder: created ' . count($scenarios) . ' call logs with transcripts.');
    }
}
