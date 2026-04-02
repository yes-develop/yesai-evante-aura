document.addEventListener('DOMContentLoaded', function() {
    // Initialize charts if they exist
    if (document.querySelector('.ct-chart-sales-value')) {
        initSalesChart();
    }

    if (document.querySelector('.ct-chart-ranking')) {
        initRankingChart();
    }

    // Initialize dropdowns
    var dropdowns = document.querySelectorAll('.dropdown-toggle');
    dropdowns.forEach(function(dropdown) {
        dropdown.addEventListener('click', function(e) {
            e.preventDefault();
            var menu = this.nextElementSibling;
            if (menu.classList.contains('show')) {
                menu.classList.remove('show');
            } else {
                menu.classList.add('show');
            }
        });
    });

    // Initialize buttons
    var buttons = document.querySelectorAll('.btn');
    buttons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            // Add ripple effect or any other functionality
            this.classList.add('active');
            setTimeout(() => {
                this.classList.remove('active');
            }, 200);
        });
    });
});

// Chart initialization functions
function initSalesChart() {
    new Chartist.Line('.ct-chart-sales-value', {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        series: [[1, 5, 2, 5, 4, 3, 7]]
    }, {
        low: 0,
        showArea: true,
        fullWidth: true,
        chartPadding: {
            right: 20,
            left: 20
        }
    });
}

function initRankingChart() {
    new Chartist.Bar('.ct-chart-ranking', {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        series: [[1, 5, 2, 5, 4, 3], [2, 3, 4, 8, 1, 2]]
    }, {
        low: 0,
        showArea: true,
        seriesBarDistance: 10,
        fullWidth: true
    });
}
