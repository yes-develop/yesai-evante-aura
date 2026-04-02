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
                <a href="{{ route('ai.knowledge') }}" class="ai-tab-item {{ request()->routeIs('ai.knowledge') ? 'active' : '' }}">
                    <i class="fas fa-book"></i>
                    <span>Knowledge Source</span>
                </a>
            </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-8 col-lg-9">
            <div class="scenario-content">
                <div class="page-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 class="fw-bold mb-1">Scenario training</h2>
                            <p class="text-muted">Train your AI chatbot to handle various customer scenarios (Q&A) effectively. <a href="#" style="color: black;">Learn more about scenario training</a></p>
                        </div>
                        <button class="btn" onclick="openScenarioPanel()" style="background: #ECF300;">
                            <i class="fas fa-plus me-2"></i> Add scenario
                        </button>
                    </div>
                </div>

                <div class="info-box">
                    <div class="d-flex align-items-center mb-3">
                        <i class="fas fa-lightbulb me-3 fa-lg"></i>
                        <h5 class="mb-0">How does it work?</h5>
                    </div>
                    <p class="text-muted mb-2">
                        You can add scenarios to create highly specific, step-by-step instructions for the AI to handle particular situations predictably. These are for predefined scenarios or responses that require consistency, often involving specific actions or follow-ups. You can also specify certain scenarios here when you do not want the AI to respond. For example, handling returns, escalating issues, or confirming orders.
                    </p>
                    <p class="text-muted mb-0">
                        <strong>Example:</strong> If a customer requests a refund for a damaged product, ask them to upload a photo of the damage and provide their order number before proceeding.
                    </p>
                </div>

                <div class="scenario-table-card">

                    <!-- Header -->
                    <div class="scenario-table-header">
                        <h4 class="fw-bold mb-0">All Scenario</h4>

                        <div class="search-section">
                            <div class="input-group">
                                <span class="input-group-text border-end-0">
                                    <i class="fas fa-search"></i>
                                </span>
                                <input type="text" id="searchInput" class="form-control border-start-0" placeholder="Search scenario...">
                            </div>
                        </div>
                    </div>

                    <!-- Table -->
                    <div class="table-responsive-ai">
                        <table class="table align-middle mb-0" id="scenarioTable">
                            <thead>
                                <tr>
                                    <th style="width:30%">Title</th>
                                    <th>Description</th>
                                    <th style="width:140px" class="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div class="scenario-pagination" id="scenarioPagination"></div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Sliding Panel for New Scenario -->
<!-- <div class="sliding-panel" id="scenarioPanel">
    <div class="panel-header">
        <h2>Create new scenario</h2>
        <button class="close-panel" onclick="closeScenarioPanel()">&times;</button>
    </div>
    <div class="panels-content">
        <p class="text-muted">Create scenarios for AI to improve automatic replies based on customer inquiries and desired responses.</p>
        
        <form id="scenarioForm">
            <div class="mb-4">
                <label class="form-label">Scenario title</label>
                <input type="text" class="form-control" placeholder="Enter scenario title">
            </div>

            

            <div class="mb-4">
                
                <textarea class="form-control" rows="5" placeholder="Describe what the AI should do when presented with this scenario. You do not need to write a specific message here, just describe what the AI should do and it will generate the response automatically."></textarea>
            </div>

            <div class="panel-footer">
                <button type="button" class="btn btn-secondary" onclick="closeScenarioPanel()">Cancel</button>
                <button type="button" class="btn btn-primary">Create scenario</button>
            </div>
        </form>
    </div>
</div> -->

<!-- Scenario Modal -->
<div class="scenario-modal" id="scenarioPanel">

    <div class="scenario-dialog">
        <div class="scenario-header">
            <h2>Create New Scenario</h2>
            <button class="close-btn" onclick="closeScenarioPanel()">×</button>
        </div>

        <p class="scenario-subtext">
            Create scenarios for AI to improve automatic replies based on customer inquiries and desired responses.
        </p>

        <form id="scenarioForm">

            <div class="mb-3">
                <label class="form-label">Scenario Title</label>
                <input type="text" class="form-control" placeholder="Enter scenario title">
            </div>

            <div class="mb-4">
                <label class="form-label">Description</label>
                <textarea class="form-control" rows="4"
                    placeholder="Describe what the AI should do when presented with this scenario. You do not need to write a specific message here, just describe what the AI should do and it will generate the response automatically."></textarea>
            </div>

            <div class="scenario-footer">
                <button type="button" class="btn btn-light" onclick="closeScenarioPanel()">Cancel</button>
                <button type="submit" class="btn btn-yellow">Create Scenario</button>
            </div>

        </form>
    </div>
</div>


@push('styles')
<link rel="stylesheet" href="{{ asset('css/ai.css?time=') }}<?php echo time();?>">
<style> 
    .input-group-text i {
        background-color: transparent;
    }

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

    .scenario-table-card #scenarioTable thead th {
        background: #FEFFE0 !important;
    }

    .search-section .form-control:focus {
        box-shadow: none;
    }

    .search-section .input-group-text {
        background-color: #f0f0f0;
        border: none;
    }

    .search-section .input-group {
        max-width: 340px;
        width: 100%;
    }

    @media (max-width: 576px) {
        .scenario-table-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
        }

        .search-section {
            width: 100%;
        }

        .search-section .input-group {
            max-width: 100%;
        }
    }

    /* =========================
       MODAL OVERLAY
    ========================= */
    .scenario-modal {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.55);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    }

    /* show */
    .scenario-modal.active {
        display: flex;
    }

    /* =========================
       DIALOG
    ========================= */
    .scenario-dialog {
        width: 520px;
        max-width: 92%;
        background: #fff;
        border-radius: 16px;
        padding: 24px 28px;
        box-shadow: 0 15px 45px rgba(0,0,0,0.25);
        animation: popIn 0.18s ease;
    }

    /* animation */
    @keyframes popIn {
        from {
            transform: scale(.95);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    /* =========================
       HEADER
    ========================= */
    .scenario-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .scenario-header h2 {
        font-size: 20px;
        font-weight: 600;
        margin: 0;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 22px;
        cursor: pointer;
        color: #888;
    }

    /* =========================
       TEXT
    ========================= */
    .scenario-subtext {
        font-size: 14px;
        color: #6c757d;
        margin-bottom: 18px;
    }

    /* =========================
       FOOTER
    ========================= */
    .scenario-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 10px;
    }

    /* Yellow primary button like screenshot */
    .btn-yellow {
        background: #e6ff00;
        border: none;
        font-weight: 600;
        padding: 8px 16px;
        border-radius: 8px;
    }
    .btn-yellow:hover {
        background: #d6f000;
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
let scenarios = []; // Array to store scenarios

function openScenarioPanel() {
    document.getElementById('scenarioPanel').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeScenarioPanel() {
    document.getElementById('scenarioPanel').classList.remove('active');
    document.body.style.overflow = '';
    // Reset form
    document.getElementById('scenarioForm').reset();
}

function updateTable() {
    const tbody = document.querySelector('#scenarioTable tbody');
    tbody.innerHTML = '';
    
    scenarios.forEach((scenario, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${scenario.title}</td>
            <td>${scenario.description}</td>
            <td>
                <button class="btn btn-sm btn-primary me-2" onclick="editScenario(${index})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm btn-primary bg-danger" onclick="deleteScenario(${index})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function editScenario(index) {
    const scenario = scenarios[index];
    const form = document.getElementById('scenarioForm');
    
    // Populate form with scenario data
    form.querySelector('input[placeholder="Enter scenario title"]').value = scenario.title;
    form.querySelector('textarea').value = scenario.description;
    
    // Store editing index
    form.dataset.editIndex = index;
    
    // Open panel
    openScenarioPanel();
}

async function deleteScenario(index) {
    if (confirm('Are you sure you want to delete this scenario?')) {
        try {
            const scenario = scenarios[index];
            
            // Prepare delete data
            const deleteData = {
                id: scenario.id,
                title: scenario.title,
                description: scenario.description,
                timestamp: new Date().toISOString(),
                source: 'scenario_creation_form',
                action: 'delete'
            };

            // Send delete request to make.com
            const makeResponse = await fetch('{{ config('services.make.webhook_scenario_url') }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deleteData)
            });

            if (!makeResponse.ok) {
                throw new Error('Failed to delete scenario on make.com');
            }

            // If successful, remove from local array
            scenarios.splice(index, 1);
            updateTable();

            // Show success message
            const tempAlert = document.createElement('div');
            tempAlert.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3';
            tempAlert.style.zIndex = '9999';
            tempAlert.innerHTML = '<i class="fas fa-check-circle me-2"></i>Scenario deleted successfully!';
            document.body.appendChild(tempAlert);

            setTimeout(() => {
                document.body.removeChild(tempAlert);
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            const tempAlert = document.createElement('div');
            tempAlert.className = 'alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3';
            tempAlert.style.zIndex = '9999';
            tempAlert.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Failed to delete scenario. Please try again.';
            document.body.appendChild(tempAlert);

            setTimeout(() => {
                document.body.removeChild(tempAlert);
            }, 3000);
        }
    }
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    const scenarioForm = document.getElementById('scenarioForm');
    const submitButton = scenarioForm.querySelector('.btn-primary');
    
    submitButton.addEventListener('click', async function(e) {
        e.preventDefault();
        
        // Get form data
        const titleInput = scenarioForm.querySelector('input[placeholder="Enter scenario title"]');
        const descriptionInput = scenarioForm.querySelector('textarea');
        
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        
        if (!title || !description) {
            if (!title) titleInput.classList.add('is-invalid');
            if (!description) descriptionInput.classList.add('invalid-feedback');
            return;
        }
        
        // Show loading state
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
        
        try {
            const editIndex = scenarioForm.dataset.editIndex;
            const scenarioData = {
                id: editIndex !== undefined ? scenarios[editIndex].id : `new_${Date.now()}`,
                title: title,
                description: description,
                timestamp: new Date().toISOString(),
                source: 'scenario_creation_form',
                action: editIndex !== undefined ? 'update' : 'create'
            };

            // Send data to make.com
            const makeResponse = await fetch('{{ config('services.make.webhook_scenario_url') }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scenarioData)
            });

            if (!makeResponse.ok) {
                throw new Error('Failed to send data to make.com');
            }

            // If make.com request is successful, update local data
            if (editIndex !== undefined) {
                // Update existing scenario
                scenarios[editIndex] = scenarioData;
                delete scenarioForm.dataset.editIndex;
            } else {
                // Add new scenario
                scenarios.push(scenarioData);
            }
            
            // Update table
            updateTable();
            
            // Show success message
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success mt-3';
            successAlert.innerHTML = `<i class="fas fa-check-circle me-2"></i>Scenario ${editIndex !== undefined ? 'updated' : 'created'} successfully!`;
            scenarioForm.appendChild(successAlert);
            
            // Reset form
            scenarioForm.reset();
            
            // Close panel after delay
            setTimeout(() => {
                closeScenarioPanel();
                scenarioForm.removeChild(successAlert);
            }, 2000);
            
        } catch (error) {
            console.error('Error:', error);
            const errorAlert = document.createElement('div');
            errorAlert.className = 'alert alert-danger mt-3';
            errorAlert.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i>Failed to save scenario. Please try again.';
            scenarioForm.appendChild(errorAlert);
            
            setTimeout(() => {
                scenarioForm.removeChild(errorAlert);
            }, 3000);
        } finally {
            // Restore button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    });
    
    // Remove invalid state on input
    scenarioForm.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('is-invalid');
        });
    });
});

// Google Sheets integration
document.addEventListener('DOMContentLoaded', function() {
    fetchSheetData();
});

function fetchSheetData() {
    const sheetId = '{{ config('services.google_sheets.id') }}';
    const sheetName = 'Prompt';
    const range = 'A:C';
    
    // Show loading state
    const tbody = document.querySelector('#scenarioTable tbody');
    if (tbody) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4"><i class="fas fa-spinner fa-spin me-2"></i>Loading data from Google Sheets...</td></tr>';
    }
    
    // Add a cache-busting parameter to avoid caching issues
    const cacheBuster = new Date().getTime();
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?sheet=${sheetName}&range=${range}&tqx=out:json&_=${cacheBuster}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.text();
        })
        .then(data => {
            try {
                // Extract JSON data from response
                const jsonData = JSON.parse(data.substring(data.indexOf('{'), data.lastIndexOf('}') + 1));
                
                // Clear existing scenarios
                scenarios = [];
                
                // Process data and add to scenarios array
                if (jsonData.table && jsonData.table.rows && jsonData.table.rows.length > 0) {
                    // Skip header row (index 0)
                    for (let i = 1; i < jsonData.table.rows.length; i++) {
                        const row = jsonData.table.rows[i];
                        if (row.c) {
                            scenarios.push({
                                id: row.c[0]?.v || '',
                                title: row.c[1]?.v || '',
                                description: row.c[2]?.v || ''
                            });
                        }
                    }
                }
                
                // Update table with fetched data
                updateTable();
                
            } catch (parseError) {
                console.error('Error parsing Google Sheets data:', parseError);
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Error parsing data. Please check console for details.</td></tr>';
                }
            }
        })
        .catch(error => {
            console.error('Error fetching Google Sheets data:', error);
            if (tbody) {
                tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-danger">Error loading data. Please check console for details.</td></tr>';
            }
        });
}

// Add search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('input[placeholder="Search scenario name"]');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const filteredScenarios = scenarios.filter(scenario => 
                scenario.title.toLowerCase().includes(searchTerm) ||
                scenario.description.toLowerCase().includes(searchTerm)
            );
            
            const tbody = document.querySelector('#scenarioTable tbody');
            if (tbody) {
                tbody.innerHTML = '';
                if (filteredScenarios.length > 0) {
                    filteredScenarios.forEach((scenario, index) => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${scenario.title}</td>
                            <td>${scenario.description}</td>
                            <td>
                                <button class="btn btn-sm btn-primary me-2" onclick="editScenario(${scenarios.indexOf(scenario)})">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteScenario(${scenarios.indexOf(scenario)})">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                } else {
                    tbody.innerHTML = '<tr><td colspan="4" class="text-center py-4">No matching scenarios found</td></tr>';
                }
            }
        });
    }
});
</script>
@endpush
@endsection 