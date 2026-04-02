@extends('layouts.app')

@section('title', 'Broadcast Management')

@section('page-title', 'Broadcast')
@section('page-subtitle', 'Create and manage your broadcasts')

@section('styles')
    <link rel="stylesheet" href="{{ asset('css/broadcasts.css?time=') }}<?php echo time();?>">
@endsection

@section('content')
    <div class="row">
        <!-- Left sidebar -->
        <div class="col-md-3">
            <div class="card mb-4">
                <div class="list-group-item" style="border-radius: 15px;">
                    <div class="list-group-item list-group-item-action dropdown-toggle" data-bs-toggle="collapse"
                        data-bs-target="#broadcastsCollapse" aria-expanded="true">
                        <i class="fa-solid fa-bullhorn me-2"></i> Broadcasts
                    </div>
                    <div class="collapse show" id="broadcastsCollapse">
                        <a href="{{ route('broadcasts.index') }}" class="list-group-item list-group-item-action active">
                            <div class="ms-4 my-3">All Broadcasts</div>
                        </a>
                        <a href="#" class="list-group-item list-group-item-action">
                            <div class="ms-4 my-3">Scheduled</div>
                        </a>
                        <a href="#" class="list-group-item list-group-item-action">
                            <div class="ms-4 my-3">Sent</div>
                        </a>
                        <a href="#" class="list-group-item list-group-item-action">
                            <div class="ms-4 my-3">Drafts</div>
                        </a>
                    </div>

                    <div class="list-group-item list-group-item-action dropdown-toggle" data-bs-toggle="collapse"
                        data-bs-target="#lineFriendsCollapse">
                        <i class="fa-brands fa-line me-2"></i> LINE Friends
                    </div>
                    <div class="collapse" id="lineFriendsCollapse">
                        <a href="#" class="list-group-item list-group-item-action">
                            <div class="ms-4 my-3">All Friends</div>
                        </a>
                        <a href="#" class="list-group-item list-group-item-action">
                            <div class="ms-4 my-3">Active Friends</div>
                        </a>
                        <a href="#" class="list-group-item list-group-item-action">
                            <div class="ms-4 my-3">Inactive Friends</div>
                        </a>
                    </div>
                </div>
            </div>

            <div class="card recent-broadcasts">
                <div class="card-header">
                    <h5 class="card-title mb-0"><i class="fa-solid fa-clock-rotate-left me-2"></i>Recent Broadcasts</h5>
                </div>
                <div class="card-body p-0">
                    <div class="list-group list-group-flush">
                        @foreach(array_slice($broadcasts, 0, 5) as $broadcast)
                            <a href="#" class="list-group-item list-group-item-action border-0">
                                <div class="d-flex w-100 justify-content-between ">
                                    <h6 class="mb-1 text-truncate ">{{ $broadcast['title'] }}</h6>
                                    <!-- <small class="text-muted">
                                        <span class="broadcast-status status-{{ $broadcast['status'] }}"></span>
                                    </small> -->
                                </div>
                                <small class="text-muted">
                                    @if($broadcast['status'] == 'scheduled')
                                        Scheduled for {{ date('M j', strtotime($broadcast['scheduled_at'])) }}
                                    @elseif($broadcast['status'] == 'sent')
                                        Sent on {{ date('M j', strtotime($broadcast['sent_at'])) }}
                                    @else
                                        Last edited {{ date('M j', strtotime($broadcast['created_at'])) }}
                                    @endif
                                </small>
                            </a>
                        @endforeach
                    </div>
                </div>
            </div>
        </div>

        <!-- Main content area -->
        <div class="col-md-6">
            <div class="card mb-4" style="border-radius: 15px;">
                <div class="card-header" style="border-radius: 15px;">
                    <h5 class="card-title mb-0">Create Broadcast</h5>
                </div>
                <div class="card-body">
                    <form id="broadcastForm">
                        <!-- Step 1: Broadcast Type -->
                        <div class="broadcast-step mb-4">
                            <div class="d-flex justify-content-between align-items-center" style="cursor: pointer;" data-bs-toggle="collapse" data-bs-target="#step1Collapse" aria-expanded="true">
                                <div>
                                    <label class="iconlabel">1</label>
                                    <label class="form-label fw-bold">Select channel</label>
                                </div>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="collapse show" id="step1Collapse">
                                <div class="d-flex gap-3">
                                    <div class="form-check channel-check">
                                        <input class="form-check-input" type="radio" name="channel" id="channelLine" value="line" checked>
                                        <label class="form-check-label channel-label" for="channelLine">
                                            <i class="fab fa-line channel-icon"></i>
                                            <span class="labelname">LINE</span>
                                        </label>
                                    </div>
                                    <div class="form-check channel-check">
                                        <input class="form-check-input" type="radio" name="channel" id="channelInstagram"
                                            value="instagram">
                                        <label class="form-check-label channel-label" for="channelInstagram">
                                            <i class="fab fa-instagram channel-icon"></i>
                                            <span class="labelname">Instagram</span>
                                        </label>
                                    </div>
                                    <div class="form-check channel-check">
                                        <input class="form-check-input" type="radio" name="channel" id="channelTelegram" value="telegram">
                                        <label class="form-check-label channel-label" for="channelTelegram">
                                            <i class="fab fa-telegram channel-icon"></i>
                                            <span class="labelname">Telegram</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 2: Timing -->
                        <div class="broadcast-step mb-4">
                            <div class="d-flex justify-content-between align-items-center" style="cursor: pointer;" data-bs-toggle="collapse" data-bs-target="#step2Collapse" aria-expanded="true">
                                <div>
                                    <label class="iconlabel">2</label>
                                    <label class="form-label fw-bold">Broadcast time</label>
                                </div>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="collapse show" id="step2Collapse">
                                <div class="d-flex flex-column mb-3">
                                    <h6>Select type</h6>
                                    <div class="d-flex flex-row gap-4 mb-2">
                                        <div  id="sendNowOption"class="form-check channel-check">
                                            <input class="form-check-input" type="radio" name="timing" id="sendNow" value="now" checked>
                                            <label class="form-check-label channel-label" for="sendNow" checked>
                                                <i class="far fa-paper-plane channel-icon"></i>
                                                <span class="labelname">Send now</span>
                                            </label>
                                        </div>
                                        <div id="sendNowOption" class="form-check channel-check">
                                            <input class="form-check-input" type="radio" name="timing" id="schedule"
                                                value="schedule">
                                            <label class="form-check-label channel-label" for="schedule">
                                                <i class="fas fa-calendar channel-icon"></i>
                                                <span class="labelname">Schedule</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div class="scheduleOptions d-none" id="scheduleOptions" >
                                        <h6>Select Time</h6>
                                        <div class="row g-2">
                                            <div class="col-md-6">
                                                <input type="date" class="form-control" id="scheduleDate">
                                            </div>
                                            <div class="col-md-6">
                                                <input type="time" class="form-control" id="scheduleTime">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 3: Targeting -->
                        <div class="broadcast-step mb-4">
                            <div class="d-flex justify-content-between align-items-center" style="cursor: pointer;" data-bs-toggle="collapse" data-bs-target="#step3Collapse" aria-expanded="true">
                                <div>
                                    <label class="iconlabel">3</label>
                                    <label class="form-label fw-bold">Choose broadcast targeting</label>
                                </div>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="collapse show" id="step3Collapse">
                                <div class="d-flex flex-row gap-4 mb-3">
                                    <div class="form-check channel-check">
                                        <input class="form-check-input" type="radio" name="targeting" id="sendToEveryone"
                                            value="everyone" checked>
                                        <label class="form-check-label channel-label" for="sendToEveryone">
                                            <span class="labelname">Send to Everyone</span>
                                        </label>
                                    </div>
                                    <div class="form-check channel-check">
                                        <input class="form-check-input" type="radio" name="targeting" id="sendToSpecific"
                                            value="specific">
                                        <label class="form-check-label channel-label" for="sendToSpecific">
                                                <span class="labelname">Sent to Specific People</span>
                                        </label>
                                    </div>
                                </div>

                                <div id="specificOptions" class="mb-3 d-none">
                                    <label class="form-label">Select labels <span class="badge bg-secondary ms-2" id="audienceCount">0 contacts</span></label>
                                    <div class="card">
                                        <div class="card-body p-3">
                                            <div id="labelsContainer">
                                                <div class="text-center py-3" id="labelsLoading">
                                                    <i class="fas fa-spinner fa-spin me-2"></i> Loading labels...
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 4: Write your broadcast -->
                        <div class="broadcast-step mb-4">
                            <div class="d-flex justify-content-between align-items-center" style="cursor: pointer;" data-bs-toggle="collapse" data-bs-target="#step4Collapse" aria-expanded="true">
                                <div>
                                    <label class="iconlabel">4</label>
                                    <label class="form-label fw-bold">Write your broadcast</label>
                                </div>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="collapse show" id="step4Collapse">
                                <div class="mb-3">
                                    <div class="message-builder-toolbar">
                                        <button type="button" class="btn btn-secondary btn-sm me-1" id="addTextBtn">
                                            <i class="fas fa-font me-1"></i> Add Text
                                        </button>
                                        <button type="button" class="btn btn-secondary btn-sm me-1" id="addImageBtn">
                                            <i class="fas fa-image me-1"></i> Add Image
                                        </button>
                                        <button type="button" class="btn btn-secondary btn-sm me-1" id="addRichBtn">
                                            <i class="fas fa-th-large me-1"></i> Add Rich Message
                                        </button>
                                        <button type="button" class="btn btn-secondary btn-sm" id="addCardBtn">
                                            <i class="fas fa-credit-card me-1"></i> Add Card Message
                                        </button>
                                    </div>

                                    <div class="message-builder-canvas mt-3" id="messageCanvas">
                                        <div message-header>Text Message</div>
                                        <div class="message-block text-block">
                                            
                                            <textarea class="form-control" rows="4"
                                                placeholder="Enter your message here..."></textarea>
                                            <div class="message-block-actions">
                                                <button type="button" class="btn btn-sm btn-light"><i
                                                        class="fas fa-arrows-alt"></i></button>
                                                <button type="button" class="btn btn-sm btn-light"><i
                                                        class="fas fa-trash-alt"></i></button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Step 5: Give your broadcast a title -->
                        <div class="broadcast-step mb-4">
                            <div class="d-flex justify-content-between align-items-center" style="cursor: pointer;" data-bs-toggle="collapse" data-bs-target="#step5Collapse" aria-expanded="true">
                                <div>
                                    <label class="iconlabel">5</label>
                                    <label class="form-label fw-bold">Give your broadcast a title</label>
                                </div>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="collapse show" id="step5Collapse">
                                <div class="mb-3 border-0">
                                    <input type="text" class="form-control" id="broadcastTitle"
                                        placeholder="Enter a title for your broadcast">
                                    <div class="form-text">This is for your reference only and won't be seen by your audience.
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div class="d-flex justify-content-between align-items-center">
                            <button type="button" class="test-btn" id="testBroadcastBtn">
                                Test Broadcast
                            </button>
                            <div class="d-flex gap-2">
                                <button type="button" class="test-btn" id="clearFormBtn" onclick="clearBroadcastForm()">
                                    Clear
                                </button>
                                <button type="submit" class="create-btn" id="sendBroadcastBtn">
                                    Create Broadcast
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Mobile preview -->
        <div class="col-md-3">
            <div class="card">
                <div class="card-body p-0">
                    <div class="mobile-preview">
                        <div class="mobile-frame">
                            <div class="mobile-screen">
                                <div class="mobile-content">
                                    <div class="chat-header">
                                        <div class="chat-name">Preview</div>
                                    </div>
                                    <div class="chat-messages" id="previewMessages">
                                        <div class="chat-message">

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Hidden templates for message types -->
    <template id="imageMessageTemplate">
        <div class="message-block image-block">
            <div class="image-placeholder">
                <div class="placeholder-content">
                    <i class="fas fa-image fa-2x mb-2"></i>
                    <div>Click to add an image</div>
                    <input type="file" class="d-none" accept="image/*">
                </div>
                <img class="preview-image d-none" src="" alt="">
            </div>
            <div class="message-block-actions">
                <button type="button" class="btn btn-sm btn-light"><i class="fas fa-arrows-alt"></i></button>
                <button type="button" class="btn btn-sm btn-light"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
    </template>

    <template id="richMessageTemplate">
        <div class="message-block rich-block">
            <div class="rich-message-editor">
                <div class="mb-2">
                    <input type="text" class="form-control" placeholder="Title">
                </div>
                <div class="mb-2">
                    <textarea class="form-control" rows="2" placeholder="Description"></textarea>
                </div>
                <div class="mb-2">
                    <input type="text" class="form-control" placeholder="Button text">
                </div>
                <div>
                    <input type="url" class="form-control" placeholder="URL">
                </div>
            </div>
            <div class="message-block-actions">
                <button type="button" class="btn btn-sm btn-light"><i class="fas fa-arrows-alt"></i></button>
                <button type="button" class="btn btn-sm btn-light"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
    </template>

    <template id="cardMessageTemplate">
        <div class="message-block card-block">
            <div class="card-message-editor">
                <div class="image-placeholder mb-2">
                    <div class="placeholder-content">
                        <i class="fas fa-image"></i>
                        <div>Card image</div>
                        <input type="file" class="d-none" accept="image/*">
                    </div>
                </div>
                <div class="mb-2">
                    <input type="text" class="form-control" placeholder="Card title">
                </div>
                <div class="mb-2">
                    <textarea class="form-control" rows="2" placeholder="Card description"></textarea>
                </div>
                <div class="d-flex gap-2">
                    <input type="text" class="form-control" placeholder="Button 1">
                    <input type="text" class="form-control" placeholder="Button 2">
                </div>
            </div>
            <div class="message-block-actions">
                <button type="button" class="btn btn-sm btn-light"><i class="fas fa-arrows-alt"></i></button>
                <button type="button" class="btn btn-sm btn-light"><i class="fas fa-trash-alt"></i></button>
            </div>
        </div>
    </template>

    <!-- Test broadcast modal -->
    <div class="modal fade" id="testBroadcastModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Test Broadcast</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Send a test message to:</p>
                    <div class="mb-3">
                        <label for="testEmail" class="form-label">Email address</label>
                        <input type="email" class="form-control" id="testEmail" placeholder="Enter email address">
                    </div>
                    <div class="mb-3">
                        <label for="testPhone" class="form-label">Phone number</label>
                        <input type="tel" class="form-control" id="testPhone" placeholder="Enter phone number">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary">Send Test</button>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('scripts')
    <script src="{{ asset('js/broadcasts.js?time=') }}<?php echo time();?>"></script>
@endsection