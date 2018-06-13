Ext.define('Ung.graph.TimeGraph', {
    extend: 'Ext.Container',
    alias: 'widget.timegraph',

    items: [{
        html: 'time'
    }],

    listeners: {
        initialize: 'onInitialize'
    },

    controller: {
        onInitialize: function () {
            var me = this;
            me.renderChart();
        },

        renderChart: function () {
            var me = this, view = me.getView();
            console.log(view.getElementConfig().dom.firstChild);
            me.chart = new Highcharts.stockChart(view.getElementConfig().dom.firstChild, {
                chart: {
                    // type: 'spline',
                    // animation: false,
                    marginRight: 20,
                    spacing: [30, 10, 15, 10],
                    style: { fontFamily: 'Roboto Condensed', fontSize: '10px' },
                    backgroundColor: 'transparent'
                },
                exporting: {
                    enabled: false
                },
                navigator: { enabled: false },
                rangeSelector : { enabled: false },
                scrollbar: { enabled: false },
                credits: { enabled: false },
                title: {
                    text: null
                },

                lang: { noData: '' },
                noData: {
                    position: {
                        verticalAlign: 'top',
                        y: 20
                    },
                    style: {
                        // fontFamily: 'Source Sans Pro',
                        padding: 0,
                        fontSize: '14px',
                        fontWeight: 'normal',
                        color: '#999',
                        textAlign: 'center'
                    },
                    useHTML: true
                },

                // colors: (me.entry.get('colors') !== null && me.entry.get('colors') > 0) ? me.entry.get('colors') : me.defaultColors,

                xAxis: {
                    // alternateGridColor: 'rgba(220, 220, 220, 0.1)',
                    lineWidth: 1,
                    tickLength: 5,
                    // gridLineWidth: 1,
                    // gridLineDashStyle: 'dash',
                    // gridLineColor: '#EEE',
                    tickPixelInterval: 120,
                    labels: {
                        style: {
                            color: '#777',
                            fontSize: '12px',
                            fontWeight: 600
                        },
                        // y: isWidget ? 15 : 20,
                        autoRotation: [-25]
                    },
                    maxPadding: 0,
                    minPadding: 0,
                    events: {
                        // afterSetExtremes: function () {
                        //     // filters the current data grid based on the zoom range
                        //     if (me.getView().up('entry')) {
                        //         me.getView().up('entry').getController().filterData(this.getExtremes().min, this.getExtremes().max);
                        //     }
                        // }
                    },
                    dateTimeLabelFormats: {
                        second: '%l:%M:%S %p',
                        minute: '%l:%M %p',
                        hour: '%l:%M %p',
                        day: '%Y-%m-%d'
                    }
                },
                yAxis: {
                    allowDecimals: true,
                    min: 0,
                    lineWidth: 1,
                    // gridLineWidth: 1,
                    gridLineDashStyle: 'dash',
                    // gridLineColor: '#EEE',
                    //tickPixelInterval: 50,
                    tickLength: 5,
                    tickWidth: 1,
                    showFirstLabel: false,
                    showLastLabel: true,
                    endOnTick: true,
                    // tickInterval: entry.get('units') === 'percent' ? 20 : undefined,
                    maxPadding: 0,
                    opposite: false,
                    labels: {
                        align: 'right',
                        useHTML: true,
                        padding: 0,
                        style: {
                            color: '#777',
                            fontSize: '12px',
                            fontWeight: 600
                        },
                        x: -10,
                        y: 4
                    },
                    title: {
                        align: 'high',
                        offset: -10,
                        y: 3,
                        rotation: 0,
                        textAlign: 'left',
                        style: {
                            color: '#555',
                            fontSize: '14px',
                            fontWeight: 600
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    animation: false,
                    shared: true,
                    followPointer: true,
                    split: false,
                    // distance: 30,
                    padding: 10,
                    hideDelay: 0,
                    backgroundColor: 'rgba(247, 247, 247, 0.95)',
                    useHTML: true,
                    style: {
                        fontSize: '14px'
                    },
                    headerFormat: '<p style="margin: 0 0 5px 0; color: #555;">{point.key}</p>',
                    dateTimeLabelFormats: {
                        second: '%Y-%m-%d, %l:%M:%S %p, %l:%M:%S %p',
                        minute: '%Y-%m-%d, %l:%M %p',
                        hour: '%Y-%m-%d, %l:%M %p',
                        day: '%Y-%m-%d'
                    }
                },
                plotOptions: {
                    column: {
                        depth: 25,
                        edgeWidth: 1,
                        edgeColor: '#FFF'
                    },
                    areaspline: {
                        lineWidth: 1
                    },
                    spline: {
                        lineWidth: 2
                    },
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        center: ['50%', '50%'],
                        showInLegend: true,
                        colorByPoint: true,

                        depth: 35,
                        minSize: 150,
                        borderWidth: 1,
                        edgeWidth: 1,
                        dataLabels: {
                            enabled: true,
                            distance: 5,
                            padding: 0,
                            reserveSpace: false,
                            formatter: function () {
                                if (this.point.percentage < 2) {
                                    return null;
                                }
                                if (this.point.name.length > 25) {
                                    return this.point.name.substring(0, 25) + '...';
                                }
                                return this.point.name + ' (' + this.point.percentage.toFixed(2) + '%)';
                            }
                        }
                    },
                    series: {
                        dataLabels: {
                            style: {
                                fontSize: '12px'
                            }
                        },
                        animation: true,
                        states: {
                            hover: {
                                lineWidthPlus: 0
                            }
                        },
                        marker: {
                            radius: 2,
                        },
                        dataGrouping: {
                            dateTimeLabelFormats: {
                                millisecond: ['%Y-%m-%d, %l:%M:%S %p', '%Y-%m-%d, %l:%M:%S %p', '-%l:%M:%S %p'],
                                second: ['%Y-%m-%d, %l:%M:%S %p', '%Y-%m-%d, %l:%M:%S %p', '-%l:%M:%S %p'],
                                minute: ['%Y-%m-%d, %l:%M %p', '%Y-%m-%d, %l:%M %p', '-%l:%M %p'],
                                hour: ['%Y-%m-%d, %l:%M %p', '%Y-%m-%d, %l:%M %p', '%Y-%m-%d, %l:%M %p'],
                                day: ['%Y-%m-%d']
                            }
                        }
                    }
                },
                legend: {
                    margin: 0,
                    y: 10,
                    // useHTML: true,
                    lineHeight: 12,
                    itemDistance: 10,
                    itemStyle: {
                        fontSize: '12px',
                        fontWeight: 600,
                        width: '120px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    },
                    symbolHeight: 8,
                    symbolWidth: 8,
                    symbolRadius: 4
                },
                loading: {
                    style: {
                        opacity: 1
                    }
                },
                series: []
            });
        }
    }
});
