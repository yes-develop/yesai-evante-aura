<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">

<!-- Footer Component -->
<div class="container">
    <footer class="d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
        <div class="col-md-4 d-flex align-items-center">
            <span class="mb-5 mb-md-0 text-body-secondary">© 2025 Company, Inc. Yesweb Design</span>
        </div>
        <ul class="nav col-md-4 justify-content-end list-unstyled d-flex icon-footer">
            <li>
                <a class="text-body-secondary facebook" href="https://www.facebook.com/yeswebdesignstudio" target="_blank" aria-label="Facebook">
                    <i class="fa-brands fa-facebook"></i>
                    <span class="icon-label">Facebook</span>
                </a>
            </li>
            <li>
                <a class="text-body-secondary globe" href="https://yeswebdesignstudio.com/" target="_blank" aria-label="Website">
                    <i class="fa-solid fa-globe"></i>
                    <span class="icon-label">Website</span>
                </a>
            </li>
            <li>
                <a class="text-body-secondary line" href="https://page.line.me/929gyasn?openQrModal=true" target="_blank" aria-label="Instagram">
                    <i class="fa-brands fa-line"></i>
                    <span class="icon-label">Line</span>
                </a>
            </li>
        </ul>
    </footer>
</div>

<style>
    .icon-footer {
        gap: 1.5rem;
    }

    .icon-footer a {
        font-size: 1.7rem;
        color: #6c757d !important;
        transition: color 0.2s, transform 0.2s;
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
    }

    .icon-footer a .icon-label {
        opacity: 0;
        visibility: hidden;
        position: absolute;
        bottom: -2.2rem;
        left: 50%;
        transform: translateX(-50%) scale(0.95);
        background: #fff;
        color: #333;
        padding: 2px 10px;
        border-radius: 8px;
        font-size: 0.85rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        pointer-events: none;
        transition: opacity 0.2s, transform 0.2s;
        white-space: nowrap;
        z-index: 10;
    }

    .icon-footer a:hover .icon-label {
        opacity: 1;
        visibility: visible;
    }

    .icon-footer a.facebook:hover {
        color: #0d6efd !important;
    }

    .icon-footer a.globe:hover {
        color: rgb(234, 108, 19) !important;
    }

    .icon-footer a.line:hover {
        color: #06C755 !important;
    }

    .icon-footer a:hover {
        text-decoration: none;
    }
</style>