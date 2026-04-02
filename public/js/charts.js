document.addEventListener('DOMContentLoaded', function() {
    // Sales value chart
    const salesValueChart = document.querySelector('.ct-chart-sales-value');
    if (salesValueChart) {
        new Chartist.Line('.ct-chart-sales-value', {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            series: [
                [0, 10, 30, 40, 80, 60, 100]
            ]
        }, {
            low: 0,
            showArea: true,
            fullWidth: true,
            plugins: [
                Chartist.plugins.tooltip()
            ],
            axisX: {
                position: 'end',
                showGrid: true
            },
            axisY: {
                showGrid: false,
                showLabel: false,
                labelInterpolationFnc: function(value) {
                    return '$' + (value / 1) + 'k';
                }
            }
        });
    }
    
    // Ranking chart
    const rankingChart = document.querySelector('.ct-chart-ranking');
    if (rankingChart) {
        new Chartist.Bar('.ct-chart-ranking', {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            series: [
                [5, 4, 3, 7, 5, 10],
                [3, 2, 9, 5, 4, 6]
            ]
        }, {
            low: 0,
            showArea: true,
            seriesBarDistance: 10,
            axisX: {
                showGrid: false
            }
        });
    }
});
