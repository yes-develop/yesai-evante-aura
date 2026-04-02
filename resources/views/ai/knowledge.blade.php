@extends('layouts.app')

@section('content')
<div class="container-fluid">
    <div class="row">

        <!-- Sidebar Tabs -->
        <div class="col-md-4 col-lg-3">
            <div class="ai-tabs">
                <a href="{{ route('ai.index') }}" class="ai-tab-item {{ request()->routeIs('ai.index') ? 'active' : '' }}">
                    <i class="fas fa-robot"></i>
                    <span>Test your AI agent</span>
                </a>

                <a href="{{ route('ai.scenario') }}" class="ai-tab-item {{ request()->routeIs('ai.scenario') ? 'active' : '' }}">
                    <i class="fas fa-tasks"></i>
                    <span>Scenario Training</span>
                </a>

                <a href="{{ route('ai.knowledge') }}" class="ai-tab-item active">
                    <i class="fas fa-book"></i>
                    <span>Knowledge Source</span>
                </a>
            </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-8 col-lg-9">
            <div class="scenario-content">

                <!-- HEADER -->
                <div class="page-header">
                    <div class="d-flex justify-content-between align-items-center">

                        <div>
                            <h2 class="fw-bold mb-1">Knowledge Source</h2>

                            <p class="text-muted mb-0">
                                Enhance the bot's responses by adding your business information to the knowledge source.
                            </p>

                            <small class="text-muted" id="storage-counter">
                                Storage: 0 / 1,000,000 characters
                            </small>
                        </div>

                        <!-- Yellow button like screenshot -->
                        <button type="button" class="btn" onclick="openKnowledgePanel()" style="background:#ECF300;">
                            <i class="fas fa-plus me-2"></i>
                            New Knowledge
                        </button>

                    </div>
                </div>


                <!-- HOW IT WORKS CARD -->
                <div class="info-box">

                    <div class="d-flex align-items-center mb-3">
                        <i class="fas fa-lightbulb me-3 fa-lg"></i>
                        <h5 class="mb-0">How does it work?</h5>
                    </div>

                    <p class="text-muted mb-2">
                        You can upload knowledge sources to provide the AI with general information about your business; either by adding a website URL, or by editing one of our templates below. These are reference materials that the AI draws from to answer customer inquiries.
                    </p>

                    <div>
                        <a href="#" class="me-3">Download General Q&A Template</a>
                        <a href="#">Download Product Details Template</a>
                    </div>

                </div>


                <!-- TABLE CARD (same style as scenario) -->
                <div class="scenario-table-card">

                    <!-- HEADER -->
                    <div class="scenario-table-header">

                        <h4 class="fw-bold mb-0">All Knowledge</h4>

                        <!-- Search -->
                        <div class="search-section">
                            <div class="search-input-wrapper">
                                <input type="text" class="form-control search-input" placeholder="Search knowledge source...">
                            </div>
                        </div>
                    </div>


                    <!-- TABLE -->
                    <div class="table-responsive-ai">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>ACTION</th>
                                    <th>NAME</th>
                                    <th>VALUE</th>
                                    <th>DATE</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody id="knowledge-sources-table">
                                <!-- Data will be loaded dynamically -->
                                <tr>
                                    <td colspan="4" class="text-center py-4">No data</td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>


                    <!-- PAGINATION -->
                    <div class="scenario-pagination" id="knowledgePagination"></div>

                </div>
            </div>
        </div>
    </div>
</div>

<!-- Popup Modal -->
<div class="knowledge-modal" id="knowledge-panel">

    <div class="knowledge-modal-card">

        <!-- HEADER -->
        <div class="modal-header-custom">
            <div class="modal-header-top">
                <h2>Add New Knowledge Source</h2>
                <button type="button" class="close-panel" onclick="closeKnowledgePanel()">&times;</button>
            </div>
            <p class="text-muted">
                You can upload file or add website URL. This will be used intelligently by the AI Assistant to generate responses.
            </p>
        </div>

        <!-- BODY -->
        <div class="modal-body-custom">

            <form id="knowledgeForm">

                <!-- NAME -->
                <div class="form-name">
                    <label class="form-label">Name<span class="text-danger">*</span></label>
                    <input type="text" class="form-control" placeholder="Enter name">
                </div>


                <!-- TYPE -->
                <div class="mb-4">
                    <label class="form-label">Type<span class="text-danger">*</span></label>

                    <div class="form-radio">
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="sourceType" id="uploadFile" checked>
                            <label class="form-check-label" for="uploadFile">
                                Upload File
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="sourceType" id="addWebsite">
                            <label class="form-check-label" for="addWebsite">
                                Add Website
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="sourceType" id="addText">
                            <label class="form-check-label" for="addText">
                                Text
                            </label>
                        </div>
                    </div>
                </div>


                <!-- UPLOAD -->
                <div class="upload-section mb-4">
                    <div class="border rounded-3 p-4 text-center">
                        <i class="fas fa-cloud-upload-alt mb-3" style="font-size: 2rem;"></i>
                        <div class="upload-btn-section">
                            <button type="button" class="btn btn-choose-files" style="border: none;">Click to upload</button>
                            <div class="text-muted">or</div>
                            <div>Drop files here</div>
                        </div>
                        <div class="text-muted small mt-1">
                            Accepted formats: .txt, .csv, .docx, .xlsx (Max 5 files, 10MB each)
                        </div>
                    </div>
                    <div class="text-muted small mt-2">
                        <i class="fas fa-info-circle me-1"></i> To help the AI retrieve relevant information effectively, we recommend that your files are well-structured. For Excel files, it's best to use the first row for headers only, with your content starting from the second row onward.
                    </div>
                </div>

                <div class="website-section mb-4" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">Website URL<span class="text-danger">*</span></label>
                        <input type="url" class="form-control" placeholder="https://example.com">
                        <div class="text-muted small mt-2">
                            Enter the website URL that contains your business information.
                        </div>
                    </div>
                </div>

                <div class="text-section mb-4" style="display: none;">
                    <div class="form-group">
                        <label class="form-label">Knowledge Text<span class="text-danger">*</span></label>
                        <textarea class="form-control" rows="10" placeholder="Enter your knowledge base text here..."></textarea>
                        <div class="text-muted small mt-2">
                            Enter the text that will be used as knowledge source. This can include FAQs, product information, policies, etc.
                        </div>
                        <div class="char-counter text-end text-muted small">
                            Characters: 0/1,000,000
                        </div>
                    </div>
                </div>
            </form>
        </div>


        <!-- FOOTER -->
        <div class="modal-footer-custom">
            <button class="btn cancle-btn" onclick="closeKnowledgePanel()">Cancel</button>
            <button class="btn add-knowledge-btn">Add knowledge source</button>
        </div>

    </div>
</div>


<!-- Sliding Panel for New Knowledge Source -->
<!-- <div class="sliding-panel" id="knowledge-panel">
    <div class="panel-header">
        <h2>Add New Knowledge Source</h2>
        <button type="button" class="close-panel" onclick="closeKnowledgePanel()">&times;</button>
    </div>
    <div class="panels-content">
        <p class="text-muted">You can upload file or add website URL. This will be used intelligently by the AI Assistant to generate responses to queries.</p>
        
        <form id="knowledgeForm">
            <div class="mb-4">
                <label class="form-label">Name<span class="text-danger">*</span></label>
                <input type="text" class="form-control" placeholder="Name">
                <div class="text-danger small">This field is required</div>
            </div>

            <div class="mb-4">
                <label class="form-label">Type<span class="text-danger">*</span></label>
                <div class="d-flex gap-4">
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="sourceType" id="uploadFile" checked>
                        <label class="form-check-label" for="uploadFile">
                            Upload File
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="sourceType" id="addWebsite">
                        <label class="form-check-label" for="addWebsite">
                            Add Website
                        </label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="sourceType" id="addText">
                        <label class="form-check-label" for="addText">
                            Text
                        </label>
                    </div>
                </div>
            </div>

            <div class="upload-section mb-4">
                <div class="border rounded-3 p-4 text-center">
                    <i class="fas fa-cloud-upload-alt text-primary mb-3" style="font-size: 2rem;"></i>
                    <div class="mb-3">Drop files here</div>
                    <div class="text-muted mb-3">or</div>
                    <button type="button" class="btn btn-outline-primary">Choose files</button>
                    <div class="text-muted small mt-3">
                        Accepted formats: .txt, .csv, .docx, .xlsx (Max 5 files, 10MB each)
                    </div>
                </div>
                <div class="text-muted small mt-2">
                    <i class="fas fa-info-circle me-1"></i> To help the AI retrieve relevant information effectively, we recommend that your files are well-structured. For Excel files, it's best to use the first row for headers only, with your content starting from the second row onward.
                </div>
            </div>

            <div class="website-section mb-4" style="display: none;">
                <div class="form-group">
                    <label class="form-label">Website URL<span class="text-danger">*</span></label>
                    <input type="url" class="form-control" placeholder="https://example.com">
                    <div class="text-muted small mt-2">
                        Enter the website URL that contains your business information.
                    </div>
                </div>
            </div>

            <div class="text-section mb-4" style="display: none;">
                <div class="form-group">
                    <label class="form-label">Knowledge Text<span class="text-danger">*</span></label>
                    <textarea class="form-control" rows="10" placeholder="Enter your knowledge base text here..."></textarea>
                    <div class="text-muted small mt-2">
                        Enter the text that will be used as knowledge source. This can include FAQs, product information, policies, etc.
                    </div>
                    <div class="char-counter text-end text-muted small">
                        Characters: 0/1,000,000
                    </div>
                </div>
            </div>

            <div class="panel-footer">
                <button type="button" class="btn btn-secondary" onclick="closeKnowledgePanel()">Cancel</button>
                <button type="button" class="btn btn-primary">Add knowledge source</button>
            </div>
        </form>
    </div>
</div> -->

@push('styles')
<link rel="stylesheet" href="{{ asset('css/ai.css?time=') }}<?php echo time();?>">
<style>
    .info-box i {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #000; 
        background-color: #ECF300; 
        width: 32px;
        height: 32px;
        padding: 8px; 
        border-radius: 50%;
        font-size: 17px;
    }

    .info-box {
        border: 1px solid rgba(0, 195, 255, 0.2);
    }

    .table-responsive-ai {
        overflow-x: auto;
    }

    .table td {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .table th {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #6c757d;
        background-color: #FEFFE0;
    }

    .table td {
        font-size: 0.875rem;
        vertical-align: middle;
    }
    
    .table tr.selected {
        background-color: #f0f7ff;
        border-left: 3px solid #0d6efd;
    }
    
    .table tr {
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    
    .table tr:hover {
        background-color: #f8f9fa;
    }

    .upload-section, .website-section, .text-section {
        border-radius: 0.5rem;
    }

    .form-control:focus {
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .form-name {
        margin-bottom: 1.5rem;
    }
    
    .form-name .form-control:focus {
        border-color: #80bdff;
        box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }
    
    .form-name .form-control {
        border: 1px solid #e9ecef ;
        background-color: #fff;
    }

    textarea.form-control {
        resize: vertical;
        min-height: 200px;
    }

    .char-counter {
        margin-top: 0.5rem;
        color: #6c757d;
    }

    .panel-content {
        padding: 1.5rem;
    }
    
    .panels-content {
        padding: 1.5rem;
    }

    /* File Upload Styling */
    .upload-section .border {
        transition: all 0.3s ease;
        cursor: pointer;
    }
    
    .upload-section .border.border-primary {
        background-color: rgba(0, 123, 255, 0.05);
        border-color: #0d6efd !important;
    }
    
    .file-list {
        background-color: #fff;
        border: 1px solid #dee2e6;
        border-radius: 0.25rem;
        max-height: 200px;
        overflow-y: auto;
    }
    
    .file-list .border-bottom:last-child {
        border-bottom: none !important;
    }
    
    .form-control.is-invalid {
        border-color: #dc3545;
        padding-right: calc(1.5em + 0.75rem);
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23dc3545' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
        background-repeat: no-repeat;
        background-position: right calc(0.375em + 0.1875rem) center;
        background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
    }

    /* ===== POPUP MODAL ===== */
    
    .knowledge-modal {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.45);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    }
    
    /* show */
    .knowledge-modal.active {
        display: flex;
    }
    
    /* card */
    .knowledge-modal-card {
        width: 650px;
        max-height: 85vh;
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: modalFade 0.2s ease;
    }
    
    /* header */
    .modal-header-custom {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .modal-header-top {
        display: flex;
        width: 100%;
        justify-content: space-between;
    }
    
    /* body scrollable */
    .modal-body-custom {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
        overflow-y: auto;
    }
    
    /* footer */
    .modal-footer-custom {
        padding: 0rem 1.5rem 1rem 1.5rem;
        border: none;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
    }
    
    /* Custom radio button styles */
    .form-radio {
        display: flex;
        gap: 1rem;
    }
    
    .form-radio .form-check {
        margin-bottom: 0;
        padding: 0;
        width: 100%;
    }
    
    .form-radio .form-check-input {
        display: none;
    }
    
    .form-radio .form-check-label {
        display: inline-block;
        width: 100%;
        padding: 8px 16px;
        border: 2px solid #e9ecef;
        border-radius: 8px;
        background-color: #F5F5F5;
        cursor: pointer;
        transition: all 0.2s ease;
        font-weight: 500;
        text-align: center;
    }
    
    .form-radio .form-check-input:checked + .form-check-label {
        background-color: #FEFFE0;
        border-color: #ECF300;
        color: #000;
    }
    
    .form-radio .form-check-label:hover {
        border-color: #ECF300;
        background-color: #FEFFE0;
    }
    
    .form-radio .form-check-input:checked + .form-check-label:hover {
        background-color: #fcfdd5ff;
        border-color: #d7df00ff;
    }
    
    /* Upload icon styling */
    .fas.fa-cloud-upload-alt {
        background-color: #ECF300;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem !important;
    }

    .upload-btn-section {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
    }

    .btn-choose-files {
        padding: 0;
        border: none;
        background: transparent;
    }
    
    .btn-choose-files:hover {
        color: #8a8a8aff;
    }

    .add-knowledge-btn {
        background-color: #ECF300;
        border: none;
    }

    .cancle-btn {
        background-color: #F5F5F5;
        border: 1px solid #E5E5E5;
    }

    .search-input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
    }

    .search-input {
        padding-left: 40px !important;
        background-color: #f8f9fa;
        border: none;
        border-radius: 8px;
    }

    .search-input:focus {
        background-color: #fff;
        box-shadow: 0 0 0 2px #ECF300;
    }

    /* Delete modal styles */
    .delete-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }

    .delete-modal-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 400px;
        width: 90%;
        text-align: center;
    }

    .delete-modal-content h3 {
        margin-bottom: 1rem;
        font-size: 1.25rem;
    }

    .delete-modal-content p {
        margin-bottom: 1.5rem;
        color: #6c757d;
    }

    .delete-modal-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
    }
    
    /* animation */
    @keyframes modalFade {
        from {
            transform: translateY(-10px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
    
    /* mobile */
    @media (max-width: 768px) {
        .knowledge-modal-card {
            width: 95%;
            max-height: 95vh;
        }
    }

</style>
@endpush

@push('scripts')
<script>
window.AppConfig = window.AppConfig || {};
window.AppConfig.MAKE_WEBHOOK_AI_CHAT_URL = '{{ config('services.make.webhook_ai_chat_url') }}';
</script>
<script src="{{ asset('js/ai.js?time=') }}<?php echo time();?>"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Load knowledge sources data
    loadKnowledgeSources();

    // Wire up knowledge search
    var knowledgeSearchInput = document.querySelector('.scenario-table-card .search-input');
    if (knowledgeSearchInput) {
        knowledgeSearchInput.addEventListener('input', function(e) {
            knowledgeSearch = (e.target.value || '').toLowerCase().trim();
            knowledgePage = 1;
            updateKnowledgeSourcesTable();
        });
    }

    // Handle source type change
    const uploadFile = document.getElementById('uploadFile');
    const addWebsite = document.getElementById('addWebsite');
    const addText = document.getElementById('addText');
    const uploadSection = document.querySelector('.upload-section');
    const websiteSection = document.querySelector('.website-section');
    const textSection = document.querySelector('.text-section');
    const knowledgeForm = document.getElementById('knowledgeForm');
    const addButton = document.querySelector('.add-knowledge-btn');

    function toggleSourceType() {
        uploadSection.style.display = 'none';
        websiteSection.style.display = 'none';
        textSection.style.display = 'none';

        if (uploadFile.checked) {
            uploadSection.style.display = 'block';
        } else if (addWebsite.checked) {
            websiteSection.style.display = 'block';
        } else if (addText.checked) {
            textSection.style.display = 'block';
        }
    }

    uploadFile.addEventListener('change', toggleSourceType);
    addWebsite.addEventListener('change', toggleSourceType);
    addText.addEventListener('change', toggleSourceType);

    // Handle character count for text input
    const textArea = textSection.querySelector('textarea');
    const charCounter = textSection.querySelector('.char-counter');
    const maxChars = 1000000;

    textArea.addEventListener('input', function() {
        const count = this.value.length;
        charCounter.textContent = `Characters: ${count.toLocaleString()}/${maxChars.toLocaleString()}`;
        
        if (count > maxChars) {
            charCounter.style.color = '#dc3545';
            this.value = this.value.substring(0, maxChars);
        } else {
            charCounter.style.color = '#6c757d';
        }
    });

    // Setup file upload
    const fileDropArea = document.querySelector('.upload-section .border');
    const chooseFileBtn = fileDropArea.querySelector('.btn-choose-files');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.multiple = true;
    fileInput.accept = '.txt,.csv,.docx,.xlsx,';
    fileInput.style.display = 'none';
    fileDropArea.appendChild(fileInput);
    
    let uploadedFiles = [];

    // Click handler for choose file button
    chooseFileBtn.addEventListener('click', function() {
        fileInput.click();
    });

    // File selection handler
    fileInput.addEventListener('change', function() {
        handleFiles(this.files);
    });

    // Drag and drop handlers
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        fileDropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        fileDropArea.classList.add('border-primary');
    }

    function unhighlight() {
        fileDropArea.classList.remove('border-primary');
    }

    fileDropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        const maxFiles = 5;
        const maxSizePerFile = 10 * 1024 * 1024; // 10MB in bytes
        let validFiles = [];
        let errors = [];

        // Check file count
        if (files.length > maxFiles) {
            errors.push(`You can upload maximum ${maxFiles} files. You selected ${files.length} files.`);
        }

        // Check each file
        for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
            const file = files[i];
            
            // Check file size
            if (file.size > maxSizePerFile) {
                errors.push(`File "${file.name}" exceeds the 10MB size limit.`);
                continue;
            }
            
            // Check file type
            const fileExt = file.name.split('.').pop().toLowerCase();
            if (!['txt', 'csv', 'docx', 'xlsx'].includes(fileExt)) {
                errors.push(`File "${file.name}" is not an accepted file type.`);
                continue;
            }
            
            validFiles.push(file);
        }

        // Display errors if any
        if (errors.length > 0) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger mt-3';
            errorDiv.innerHTML = `<strong>Error:</strong><ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>`;
            
            const existingError = fileDropArea.parentElement.querySelector('.alert-danger');
            if (existingError) {
                existingError.remove();
            }
            
            fileDropArea.parentElement.appendChild(errorDiv);
            
            // Auto-remove error message after 5 seconds
            setTimeout(() => {
                errorDiv.remove();
            }, 5000);
        }

        // Update files array with valid files
        uploadedFiles = [...uploadedFiles, ...validFiles];
        if (uploadedFiles.length > maxFiles) {
            uploadedFiles = uploadedFiles.slice(0, maxFiles);
        }
        
        updateFileList();
    }

    function updateFileList() {
        // Remove previous file list if it exists
        const existingFileList = document.querySelector('.file-list');
        if (existingFileList) {
            existingFileList.remove();
        }
        
        if (uploadedFiles.length === 0) return;
        
        // Create and display file list
        const fileList = document.createElement('div');
        fileList.className = 'file-list mt-3';
        
        uploadedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'd-flex justify-content-between align-items-center p-2 border-bottom';
            
            const fileName = document.createElement('div');
            fileName.className = 'text-truncate';
            fileName.textContent = file.name;
            
            const fileSize = document.createElement('div');
            fileSize.className = 'text-muted small ms-2';
            fileSize.textContent = formatFileSize(file.size);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-sm text-danger';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', () => {
                uploadedFiles.splice(index, 1);
                updateFileList();
            });
            
            fileItem.appendChild(fileName);
            fileItem.appendChild(fileSize);
            fileItem.appendChild(removeBtn);
            fileList.appendChild(fileItem);
        });
        
        fileDropArea.after(fileList);
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Process uploaded files
    async function readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsText(file);
        });
    }

    // Handle form submission
    addButton.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Get form data
        const nameInput = knowledgeForm.querySelector('input[placeholder="Enter name"]');
        const name = nameInput.value.trim();
        
        if (!name) {
            nameInput.classList.add('is-invalid');
            return;
        }

        let sourceType = '';
        let content = '';
        let textFiles = [];

        if (uploadFile.checked) {
            sourceType = 'file';
            if (uploadedFiles.length === 0) {
                alert('Please upload at least one file.');
                return;
            }
            
            // Process uploaded files
            try {
                for (const file of uploadedFiles) {
                    const fileContent = await readFileContent(file);
                    textFiles.push({
                        name: file.name,
                        content: fileContent,
                        type: file.type,
                        size: file.size
                    });
                    console.log(`Read file ${file.name}:`, fileContent.substring(0, 100) + '...'); // Log first 100 chars
                }
                content = 'Files uploaded'; // Placeholder content
            } catch (error) {
                console.error('Error reading files:', error);
                alert('Error reading one or more files. Please try again.');
                return;
            }
        } else if (addWebsite.checked) {
            sourceType = 'website';
            const urlInput = websiteSection.querySelector('input[type="url"]');
            content = urlInput.value.trim();
            if (!content) {
                urlInput.classList.add('is-invalid');
                return;
            }
        } else if (addText.checked) {
            sourceType = 'text';
            content = textArea.value.trim();
            if (!content) {
                textArea.classList.add('is-invalid');
                return;
            }
        }

        // Show loading state
        const originalText = addButton.innerHTML;
        addButton.disabled = true;
        addButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';

        try {
            // Format content correctly based on source type
            let formattedContent = content;
            if (sourceType === 'website' && formattedContent) {
                // Clean up website URL if needed
                if (formattedContent.startsWith('http://')) {
                    formattedContent = formattedContent.substring(7);
                } else if (formattedContent.startsWith('https://')) {
                    formattedContent = formattedContent.substring(8);
                }
                
                // Remove "www." if present to match the format in the screenshot
                if (formattedContent.startsWith('www.')) {
                    formattedContent = formattedContent;
                }
            }
            
            // Prepare data for webhook
            const webhookData = {
                action: sourceType === 'file' ? 'upload' : sourceType,
                name: name,
                content: formattedContent,
                timestamp: new Date().toISOString(),
                textFiles: sourceType === 'file' ? textFiles : [], // Include textFiles array only for file uploads
                summary: {
                    totalFiles: sourceType === 'file' ? textFiles.length : 0,
                    totalSize: sourceType === 'file' ? textFiles.reduce((acc, file) => acc + file.size, 0) : 0
                }
            };

            console.log('Sending data to webhook:', webhookData); // Log the data being sent

            // Send data to Make.com webhook
            const webhookUrl = '{{ config('services.make.webhook_knowledge_url') }}';
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(webhookData)
            });

            if (!response.ok) {
                throw new Error('Failed to send data to webhook');
            }

            console.log('Data sent to webhook successfully:', webhookData);
            
            // Show success message
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success mt-3';
            successAlert.innerHTML = '<i class="fas fa-check-circle me-2"></i>Knowledge source added successfully!';
            knowledgeForm.appendChild(successAlert);

            // Add the new row directly to our table
            const tbody = document.getElementById('knowledge-sources-table');
            updateSingleRow(webhookData, tbody);
            
            // Update the storage counter
            const storageCounter = document.getElementById('storage-counter');
            const currentStorage = parseInt(storageCounter.textContent.match(/\d+/)[0].replace(/,/g, ''));
            const newStorage = currentStorage + (webhookData.content ? webhookData.content.length : 0);
            storageCounter.textContent = `Storage: ${newStorage.toLocaleString()} / 1,000,000 characters.`;

            // Reset form and file list
            knowledgeForm.reset();
            uploadedFiles = [];
            updateFileList();
            toggleSourceType();

            // Close panel after delay
            setTimeout(() => {
                closeKnowledgePanel();
                knowledgeForm.removeChild(successAlert);
            }, 2000);
        } catch (error) {
            console.error('Error:', error);
            const errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-danger mt-3';
            errorAlert.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Failed to add knowledge source. Please try again.';
            knowledgeForm.appendChild(errorAlert);

            setTimeout(() => {
                knowledgeForm.removeChild(errorAlert);
            }, 3000);
        } finally {
            // Restore button state
            addButton.disabled = false;
            addButton.innerHTML = originalText;
        }
    });

    // Remove invalid state on input
    knowledgeForm.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('is-invalid');
        });
    });
});

async function loadKnowledgeSources() {
    try {
        // Google Sheets ID
        const sheetId = '{{ config('services.google_sheets.id') }}';
        const sheetName = 'Knowledge';
        
        // Try using the fetch API directly
        try {
            // Using a public JSON endpoint that supports CORS
            const publicEndpoint = `https://opensheet.elk.sh/${sheetId}/${sheetName}`;
            console.log(`Attempting to fetch data from: ${publicEndpoint}`);
            
            const response = await fetch(publicEndpoint);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch from Google Sheets: ${response.status} ${response.statusText}`);
            }
            
            let data;
            try {
                data = await response.json();
                console.log('Raw response data:', data);
            } catch (parseError) {
                console.error('Error parsing JSON:', parseError);
                throw new Error('Invalid JSON response from Google Sheets');
            }
            
            // Handle empty or invalid response data
            if (!data) {
                console.log('No data received from API');
                return useMockData();
            }
            
            // If data is an empty array or object, use mock data
            if ((Array.isArray(data) && data.length === 0) || 
                (typeof data === 'object' && Object.keys(data).length === 0)) {
                console.log('Empty data received from API');
                return useMockData();
            }
            
            // Map the data to our expected format
            const sources = data.map(item => {
                // Check if it's a website and make sure URLs are properly formatted
                let content = item.Value || '';
                const action = item.Action || '';
                
                // Log the raw data for debugging
                console.log('Processing row:', {action, name: item.Name, value: content});
                
                return {
                    action: action.toLowerCase(),
                    name: item.Name || '',
                    content: content,
                    timestamp: item.Date || new Date().toISOString()
                };
            });
            
            updateKnowledgeSourcesTable(sources);
            
        } catch (error) {
            console.error('Error fetching from Google Sheets:', error);
            useMockData();
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        useMockData();
    }
}

// Helper function to use mock data
function useMockData() {
    console.log('Using mock data as fallback');
    const mockData = [
        {
            action: 'upload',
            name: 'knowledge.txt',
            content: 'https://drive.google.com/file/d/1CIVJ4iuUi_KEktnw5MiVJeq895pxT6PH',
            timestamp: '2025-04-28T04:48:19.887Z'
        },
        {
            action: 'website',
            name: 'yesaihotel',
            content: 'www.yesaihotel.com',
            timestamp: '2025-04-28T04:49:29.200Z'
        },
        {
            action: 'text',
            name: 'text test',
            content: 'Hello',
            timestamp: '2025-04-28T04:51:11.173Z'
        }
    ];
    updateKnowledgeSourcesTable(mockData);
}

var knowledgePage = 1;
var knowledgeRowsPerPage = 5;
var knowledgeAllSources = [];
var knowledgeSearch = '';

function buildKnowledgePageNumbers(current, total) {
    var pages = [];
    if (total <= 7) {
        for (var i = 1; i <= total; i++) pages.push(i);
        return pages;
    }
    pages.push(1);
    if (current > 3) pages.push('...');
    for (var i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
    }
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
}

function renderKnowledgePagination(totalFiltered) {
    var container = document.getElementById('knowledgePagination');
    if (!container) return;

    var totalPages = Math.ceil(totalFiltered / knowledgeRowsPerPage);
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    var pageNums = buildKnowledgePageNumbers(knowledgePage, totalPages);
    var pagesHtml = pageNums.map(function(p) {
        if (p === '...') return '<span class="page-number">\u2026</span>';
        return '<div class="page-number' + (p === knowledgePage ? ' active' : '') + '" data-page="' + p + '">' + p + '</div>';
    }).join('');

    container.innerHTML =
        '<button class="page-btn" data-page="prev"' + (knowledgePage === 1 ? ' disabled' : '') + '>\u2190 Previous</button>' +
        '<div class="page-numbers">' + pagesHtml + '</div>' +
        '<button class="page-btn" data-page="next"' + (knowledgePage === totalPages ? ' disabled' : '') + '>Next \u2192</button>';

    container.querySelectorAll('[data-page]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (btn.disabled) return;
            var val = btn.dataset.page;
            var newPage = knowledgePage;
            if (val === 'prev') newPage = knowledgePage - 1;
            else if (val === 'next') newPage = knowledgePage + 1;
            else newPage = parseInt(val, 10);
            if (newPage >= 1 && newPage <= totalPages && newPage !== knowledgePage) {
                knowledgePage = newPage;
                renderKnowledgeTable();
            }
        });
    });
}

function renderKnowledgeTable() {
    updateKnowledgeSourcesTable();
}

function updateKnowledgeSourcesTable(sources) {
    // If called with new data, store it
    if (sources !== undefined) {
        knowledgeAllSources = sources || [];
    }

    var allSources = knowledgeAllSources;
    var tbody = document.getElementById('knowledge-sources-table');

    // Clear existing content
    tbody.innerHTML = '';

    // Calculate storage from ALL sources (not filtered)
    var totalChars = 0;
    allSources.forEach(function(source) {
        if (source.content) totalChars += source.content.length;
    });
    var storageEl = document.getElementById('storage-counter');
    if (storageEl) {
        storageEl.textContent = allSources.length === 0
            ? 'Storage: 0 / 1,000,000 characters.'
            : 'Storage: ' + totalChars.toLocaleString() + ' / 1,000,000 characters.';
    }

    // Filter by search
    var filtered = allSources;
    if (knowledgeSearch) {
        filtered = allSources.filter(function(s) {
            var term = knowledgeSearch;
            return (s.name || '').toLowerCase().includes(term)
                || (s.action || '').toLowerCase().includes(term)
                || (s.content || '').toLowerCase().includes(term);
        });
    }

    if (filtered.length === 0) {
        var row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" class="text-center py-4">No data</td>';
        tbody.appendChild(row);
        renderKnowledgePagination(0);
        return;
    }

    // Paginate
    var totalPages = Math.ceil(filtered.length / knowledgeRowsPerPage);
    knowledgePage = Math.max(1, Math.min(knowledgePage, totalPages));
    var start = (knowledgePage - 1) * knowledgeRowsPerPage;
    var pageRows = filtered.slice(start, start + knowledgeRowsPerPage);

    // Add each source to the table
    pageRows.forEach(function(source) {
        const row = document.createElement('tr');

        // Add click event to select the row
        row.addEventListener('click', function() {
            document.querySelectorAll('#knowledge-sources-table tr').forEach(function(tr) {
                tr.classList.remove('selected');
            });
            this.classList.add('selected');
        });

        // Action column
        const actionCell = document.createElement('td');
        actionCell.textContent = source.action || '';
        row.appendChild(actionCell);

        // Name column
        const nameCell = document.createElement('td');
        nameCell.textContent = source.name || '';
        row.appendChild(nameCell);

        // Value column
        const valueCell = document.createElement('td');
        if (source.action === 'website' && source.content) {
            const link = document.createElement('a');
            let url = source.content;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                if (!url.startsWith('/')) {
                    url = 'https://' + url;
                }
            }
            link.href = url;
            link.textContent = source.content;
            link.target = '_blank';
            link.className = 'text-primary';
            valueCell.appendChild(link);
        } else if (source.action === 'upload' && source.content) {
            const link = document.createElement('a');
            link.href = source.content;
            link.textContent = source.content;
            link.target = '_blank';
            link.className = 'text-primary';
            valueCell.appendChild(link);
        } else {
            valueCell.textContent = source.content || '';
        }
        row.appendChild(valueCell);

        // Date column
        const dateCell = document.createElement('td');
        if (source.timestamp) {
            dateCell.textContent = source.timestamp;
        }
        row.appendChild(dateCell);

        // Delete button column
        const deleteCell = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-outline-danger btn-sm';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            showDeleteModal(source);
        });
        deleteCell.appendChild(deleteBtn);
        row.appendChild(deleteCell);

        tbody.appendChild(row);
    });

    renderKnowledgePagination(filtered.length);
}

function openKnowledgePanel() {
    document.getElementById('knowledge-panel').classList.add('active');
}

function closeKnowledgePanel() {
    document.getElementById('knowledge-panel').classList.remove('active');
}

// Helper function to add a single row to the table
function updateSingleRow(source, tbody) {
    const row = document.createElement('tr');
    
    // Add click event to select the row
    row.addEventListener('click', function() {
        // Remove selected class from all rows
        document.querySelectorAll('#knowledge-sources-table tr').forEach(tr => {
            tr.classList.remove('selected');
        });
        // Add selected class to clicked row
        this.classList.add('selected');
    });
    
    // Action column
    const actionCell = document.createElement('td');
    actionCell.textContent = source.action || '';
    row.appendChild(actionCell);
    
    // Name column
    const nameCell = document.createElement('td');
    nameCell.textContent = source.name || '';
    row.appendChild(nameCell);
    
    // Value column
    const valueCell = document.createElement('td');
    if (source.action === 'website' && source.content) {
        const link = document.createElement('a');
        // Ensure website URLs have proper http/https prefix
        let url = source.content;
        console.log('Single Row - Original website URL:', url);
        
        // Properly handle URLs to ensure they're absolute
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // If it's already a relative URL (starts with '/'), don't prepend domain
            if (!url.startsWith('/')) {
                url = 'https://' + url;
            }
            console.log('Single Row - Fixed website URL:', url);
        }
        
        link.href = url;
        link.textContent = source.content;
        link.target = '_blank';
        link.className = 'text-primary';
        valueCell.appendChild(link);
    } else if (source.action === 'upload' && source.content) {
        const link = document.createElement('a');
        link.href = source.content;
        link.textContent = source.content;
        link.target = '_blank';
        link.className = 'text-primary';
        valueCell.appendChild(link);
    } else {
        valueCell.textContent = source.content || '';
    }
    row.appendChild(valueCell);
    
    // Date column
    const dateCell = document.createElement('td');
    if (source.timestamp) {
        dateCell.textContent = source.timestamp;
    }
    row.appendChild(dateCell);
    
    tbody.appendChild(row);
}

// Delete confirmation modal
let itemToDelete = null;

function showDeleteModal(source) {
    itemToDelete = source;
    const modal = document.createElement('div');
    modal.className = 'delete-modal';
    modal.innerHTML = `
        <div class="delete-modal-content">
            <h3>Remove Source?</h3>
            <p>Are you sure you want to remove ${source.content || source.name}? You can't undo this action.</p>
            <div class="delete-modal-buttons">
                <button class="btn btn-secondary" onclick="closeDeleteModal()">Cancel</button>
                <button class="btn btn-danger" onclick="confirmDelete()">Remove</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeDeleteModal() {
    const modal = document.querySelector('.delete-modal');
    if (modal) {
        modal.remove();
    }
    itemToDelete = null;
}

function confirmDelete() {
    if (itemToDelete) {
        console.log('Deleting item:', itemToDelete);
        // TODO: Add actual delete API call here
        // For now, just remove from table
        closeDeleteModal();
        // You might want to refresh the table after deletion
        // loadKnowledgeSources();
    }
}
</script>
@endpush
@endsection 