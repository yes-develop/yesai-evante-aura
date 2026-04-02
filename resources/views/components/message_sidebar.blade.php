<!-- Message sidebar -->
<div class="message-sidebar">
    <div class="message-sidebar-header">
        <h2>Messages</h2>
    </div>
    <div class="message-sidebar-content">
        <ul class="message-menu">
            <li class="{{ request()->routeIs('messages.index') ? 'active' : '' }}">
                <a href="{{ route('messages.index') }}" class="menu-item">
                    <i class="fi fi-tr-inbox-in"></i>
                    <span>All Messages</span>
                </a>
            </li>
            <li class="{{ request()->routeIs('contacts.*') ? 'active' : '' }}">
                <a href="{{ route('contacts.index') }}" class="menu-item">
                    <i class="fi fi-tr-address-book"></i>
                    <span>Contacts</span>
                </a>
            </li>
        </ul>
    </div>
</div> 