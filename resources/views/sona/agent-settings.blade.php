@extends('layouts.app')

@section('title', 'SONA Agent Settings')

@section('styles')
<link rel="stylesheet" href="{{ asset('css/sona-agent-settings.css') }}?v={{ time() }}">
@endsection

@section('content')
@if(session('success'))
<div style="margin-bottom: 1rem; padding: 0.75rem 1.25rem; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; color: #16a34a; font-size: 0.9rem; font-weight: 600;">
    <i class="fas fa-circle-check" style="margin-right: 0.5rem;"></i>{{ session('success') }}
</div>
@endif
<form method="POST" action="{{ route('sona.agent_settings.save') }}" enctype="multipart/form-data">
@csrf
<div class="agent-settings-page">
    <div class="agent-settings-card">
        {{-- Voice Selection --}}
        <div class="settings-field">
            <label class="settings-label">Voice Selection</label>
            <div class="settings-control" style="display: flex; align-items: center; gap: 0.75rem;">
                <select class="settings-select" name="voice">
                    <option>Voice 2</option>
                    <option>Voice 1</option>
                    <option>Voice 3</option>
                </select>
                <button class="voice-preview-btn" title="Preview voice"><i class="fas fa-play"></i></button>
            </div>
        </div>

        {{-- Language --}}
        <div class="settings-field">
            <label class="settings-label">Language</label>
            <div class="settings-control">
                <select class="settings-select" name="language">
                    <option>English (US)</option>
                    <option>English (UK)</option>
                    <option>Thai</option>
                    <option>Japanese</option>
                </select>
            </div>
        </div>

        {{-- Greeting --}}
        <div class="settings-field settings-field--top">
            <label class="settings-label">Greeting</label>
            <div class="settings-control">
                <textarea class="settings-textarea" name="greeting" placeholder="Enter Greeting message..." rows="4"></textarea>
            </div>
        </div>

        {{-- Personality --}}
        <div class="settings-field settings-field--top">
            <label class="settings-label">Personality</label>
            <div class="settings-control">
                <div class="pill-group">
                    <button class="pill-btn active">Default</button>
                    <button class="pill-btn">Professional</button>
                    <button class="pill-btn">Friendly</button>
                </div>
                <p class="settings-hint">Lorem ipsum dolor sit amet consectetur. Enim montes id fusce.</p>
            </div>
        </div>

        {{-- Knowledge Base --}}
        <div class="settings-field settings-field--top">
            <label class="settings-label">Knowledge Base</label>
            <div class="settings-control">
                <div class="kb-section">
                    <span class="kb-type-label">Type</span>
                    <div class="pill-group">
                        <button class="pill-btn active">Upload File</button>
                        <button class="pill-btn">Add Website</button>
                        <button class="pill-btn">Text</button>
                    </div>
                </div>
                <div class="upload-zone" id="uploadZone">
                    <div class="upload-icon">
                        <img src="{{ asset('assets/img/upload-cloud-02.svg') }}" alt="Upload icon">
                    </div>
                    <p><strong>Click to upload</strong> <span class="upload-subtext">or drag and drop</span></p>
                    <span class="upload-hint">Accepted formats: .txt, .csv, .docx, .xlsx (Max 5 files, 10MB each)</span>
                    <input type="file" id="fileUpload" multiple accept=".txt,.csv,.docx,.xlsx" hidden>
                </div>
            </div>
        </div>

        <input type="hidden" name="personality" id="personalityInput" value="Default">

        {{-- Action Buttons --}}
        <div class="settings-actions is-hidden">
            <button type="button" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-update">Update</button>
        </div>
    </div>
</div>
</form>
@endsection

@push('scripts')
<script>
document.addEventListener('DOMContentLoaded', function() {
    var actionBar = document.querySelector('.settings-actions');
    var settingsDirty = false;

    function showActionBar() {
        if (!settingsDirty && actionBar) {
            settingsDirty = true;
            actionBar.classList.remove('is-hidden');
        }
    }

    // Pill button toggle
    var personalityInput = document.getElementById('personalityInput');
    document.querySelectorAll('.pill-group').forEach(function(group) {
        group.querySelectorAll('.pill-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                group.querySelectorAll('.pill-btn').forEach(function(b) { b.classList.remove('active'); });
                this.classList.add('active');
                if (personalityInput && group.closest('.settings-field') && group.closest('.settings-field').querySelector('.settings-label') &&
                    group.closest('.settings-field').querySelector('.settings-label').textContent.trim() === 'Personality') {
                    personalityInput.value = this.textContent.trim();
                }
                showActionBar();
            });
        });
    });

    // Cancel button
    var cancelBtn = document.querySelector('.btn-cancel');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            settingsDirty = false;
            if (actionBar) actionBar.classList.add('is-hidden');
        });
    }

    // Inputs & textareas
    document.querySelectorAll('.settings-select').forEach(function(select) {
        select.addEventListener('change', showActionBar);
    });

    document.querySelectorAll('.settings-textarea').forEach(function(textarea) {
        textarea.addEventListener('input', showActionBar);
    });

    // Upload zone click & drag
    var uploadZone = document.getElementById('uploadZone');
    var fileInput = document.getElementById('fileUpload');
    if (uploadZone && fileInput) {
        uploadZone.addEventListener('click', function() { fileInput.click(); });
        uploadZone.addEventListener('dragover', function(e) { e.preventDefault(); this.classList.add('dragover'); });
        uploadZone.addEventListener('dragleave', function() { this.classList.remove('dragover'); });
        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('dragover');
            showActionBar();
        });
        fileInput.addEventListener('change', showActionBar);
    }
});
</script>
@endpush
