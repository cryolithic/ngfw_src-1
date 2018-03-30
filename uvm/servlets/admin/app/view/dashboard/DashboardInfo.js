Ext.define('Ung.view.dashboard.Info', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.dashboardinfo',

    bodyCls: 'dashboard-info',

    viewModel: true,

    scrollable: true,
    reserveScrollbar: true,

    style: { background: '#FFF' }, // 1b1e27 // 3b3e46 // d8d8d8
    // border: true,
    defaults: {
        xtype: 'container',
        style: { background: 'transparent' },
    },
    bodyPadding: 10,
    items: [{
        bind: {
            html: '<h1>{stats.hostname} ({stats.appliance})</h1><p>{stats.version}, {stats.architecture}</p><br/>' +
                  '<p style="font-size: 12px; color: #999;">{stats.cpuModel}</p>' +
                  '<p style="font-size: 12px; color: #999;">{stats.numCpus} cpus</p>' +
                  '<p style="font-size: 12px; color: #999;">uptime: {stats.uptimeFormatted}</p>'
        }
    }, {
        margin: '20 0',
        style: {
            // textAlign: 'center'
        },
        bind: {
            html: '<div class="percent">' +
                    '<span style="font-weight: 600;">Memory</span>' +
                    '<p style="color: #005e84;">{stats.usedMemoryPercent}%</p>' +
                    '<svg viewBox="0 0 50 50" width="100%" height="100%">' +
                        '<circle r="15.915" cx="50%" cy="50%" style="fill: none; stroke-width: 5; stroke: #EFEFEF;"></circle>' +
                        '<circle r="15.915" cx="50%" cy="50%" style="fill: none; stroke-width: 5; stroke-dasharray: {stats.usedMemoryPercent} {stats.freeMemoryPercent}; stroke-dashoffset: 25; stroke: #005e84;"></circle>' +
                    '</svg>' +
                    '<span style="color: #005e84;">{stats.usedMemory}</span><br/>' +
                    '<span style="font-size: 11px;">{stats.totalMemory}</span>' +
                  '</div>' +
                  '<div class="percent">' +
                  '<span style="font-weight: 600;">Swap</span>' +
                    '<p style="color: #924f07;">{stats.usedSwapPercent}%</p>' +
                    '<svg viewBox="0 0 50 50" width="100%" height="100%">' +
                        '<circle r="15.915" cx="50%" cy="50%" style="fill: none; stroke-width: 5; stroke: #EFEFEF;"></circle>' +
                        '<circle r="15.915" cx="50%" cy="50%" style="fill: none; stroke-width: 5; stroke-dasharray: {stats.usedSwapPercent} {stats.freeSwapPercent}; stroke-dashoffset: 25; stroke: #924f07;"></circle>' +
                    '</svg>' +
                    '<span style="color: #924f07;">{stats.usedSwap}</span><br/>' +
                    '<span style="font-size: 11px;">{stats.totalSwap}</span>' +
                  '</div>' +
                  '<div class="percent">' +
                    '<span style="font-weight: 600;">Disk</span>' +
                    '<p style="color: #9c0c0c;">{stats.usedDiskPercent}%</p>' +
                    '<svg viewBox="0 0 50 50" width="100%" height="100%">' +
                        '<circle r="15.915" cx="50%" cy="50%" style="fill: none; stroke-width: 5; stroke: #EFEFEF;"></circle>' +
                        '<circle r="15.915" cx="50%" cy="50%" style="fill: none; stroke-width: 5; stroke-dasharray: {stats.usedDiskPercent} {stats.freeDiskPercent}; stroke-dashoffset: 25; stroke: #9c0c0c;"></circle>' +
                    '</svg>' +
                    '<span style="color: #9c0c0c;">{stats.usedDisk}</span><br/>' +
                    '<span style="font-size: 11px;">{stats.totalDisk}</span>' +
                  '</div>'
        }
    }, {
        xtype: 'container',
        items: [{
            xtype: 'component',
            html: '<strong>' + 'CPU Load'.t() + '</strong>'
        }, {
            xtype: 'component',
            style: { borderRadius: '3px', overflow: 'hidden' },
            margin: '5 0',
            width: 230,
            height: 60,
            reference: 'cpulinechart'
        }, {
            xtype: 'container',
            margin: '10 0 30 0',
            items: [{
                xtype: 'component',
                bind: {
                    html: '<div class="cpubar">' +
                      '<div style="left: {stats.oneMinuteLoadAvg/(stats.numCpus + 6) * 100}%"><em></em><p><strong>{stats.oneMinuteLoadAvg}</strong></p></div>' +
                      '<span class="low" style="width: {(stats.numCpus + 1)/(stats.numCpus + 6) * 100}%"></span>' +
                      '<span class="medium" style="width: {(stats.numCpus + 4)/(stats.numCpus + 6) * 100}%"></span>' +
                      '<span class="high" style="width: 100%;"></span>' +
                      '</div>'
                }
            }]
        }]
    }, {
        xtype: 'component',
        margin: '10 0',
        bind: {
            html: '<p>Active Hosts: <strong>{stats.activeHosts} (max. {stats.maxActiveHosts})</strong></p>' +
                  '<p>Known Devices: <strong>{stats.knownDevices}</strong></p>'
        }
    }, {
        xtype: 'component',
        margin: '10 0',
        bind: {
            html: '<p>Total Sessions: <strong>100</strong></p>' +
                  '<p>Scanned Sessions: <strong>50</strong></p>' +
                  '<p>Bypassed Sessions: <strong>50</strong></p>'
        }
    }],


    controller: {
        control: {
            '#': {
                afterrender: 'onAfterRender'
            }
        },
        listen: {
            store: {
                '#stats': {
                    datachanged: 'addPoint'
                }
            }
        },
        onAfterRender: function (view) {
            this.lineChart = new Highcharts.Chart({
                chart: {
                    type: 'areaspline',
                    // width: '100%',
                    renderTo: view.lookup('cpulinechart').getEl().dom,
                    // marginBottom: 15,
                    // marginTop: 20,
                    // marginLeft: 0,
                    // marginRight: 0,
                    margin: [0, 0, 0, 0],
                    backgroundColor: 'rgba(100, 200, 200, 0.2)',
                    animation: true,
                    style: {
                        fontFamily: 'Source Sans Pro',
                        fontSize: '12px'
                    }
                },
                title: null,
                credits: {
                    enabled: false
                },
                exporting: {
                    enabled: false
                },
                xAxis: [{
                    type: 'datetime',
                    // crosshair: {
                    //     width: 1,
                    //     dashStyle: 'ShortDot',
                    //     color: 'rgba(100, 100, 100, 0.3)'
                    // },
                    lineColor: '#C0D0E0',
                    lineWidth: 0,
                    tickLength: 0,
                    gridLineWidth: 0,
                    // gridLineDashStyle: 'dash',
                    // gridLineColor: '#EEE',
                    labels: {
                        enabled: false,
                        style: {
                            fontFamily: 'Source Sans Pro',
                            color: '#999',
                            fontSize: '11px',
                            fontWeight: 600
                        },
                        y: 12
                    },
                    maxPadding: 0,
                    minPadding: 0
                }],
                yAxis: {
                    min: 0,
                    minRange: 2,
                    lineColor: '#C0D0E0',
                    lineWidth: 1,
                    gridLineWidth: 0,
                    gridLineDashStyle: 'dash',
                    gridLineColor: '#333',
                    tickAmount: 4,
                    tickLength: 0,
                    tickWidth: 1,
                    tickPosition: 'inside',
                    opposite: false,
                    labels: {
                        enabled: false,
                        align: 'left',
                        useHTML: true,
                        padding: 0,
                        style: {
                            fontFamily: 'Source Sans Pro',
                            color: '#999',
                            fontSize: '11px',
                            fontWeight: 600,
                            // background: 'rgba(255, 255, 255, 0.6)',
                            padding: '0 1px',
                            borderRadius: '2px',
                            //textShadow: '1px 1px 1px #000'
                            lineHeight: '11px'
                        },
                        x: 1,
                        y: -2
                    },
                    title: null
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    shared: true,
                    animation: true,
                    followPointer: true,
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderWidth: 1,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    style: {
                        textAlign: 'right',
                        fontFamily: 'Source Sans Pro',
                        padding: '5px',
                        fontSize: '10px',
                        marginBottom: '40px'
                    },
                    //useHTML: true,
                    hideDelay: 0,
                    shadow: false,
                    headerFormat: '<span style="font-size: 11px; line-height: 1.5; font-weight: bold;">{point.key}</span><br/>',
                    pointFormatter: function () {
                        var str = '<span>' + this.series.name + '</span>';
                        str += ': <span style="color: ' + this.color + '; font-weight: bold;">' + this.y + '</span>';
                        return str + '<br/>';
                    }
                },
                plotOptions: {
                    areaspline: {
                        fillOpacity: 0.15,
                        lineWidth: 2
                    },
                    series: {
                        marker: {
                            enabled: true,
                            radius: 0,
                            states: {
                                hover: {
                                    enabled: true,
                                    lineWidthPlus: 2,
                                    radius: 4,
                                    radiusPlus: 2
                                }
                            }
                        },
                        states: {
                            hover: {
                                enabled: true,
                                lineWidthPlus: 0,
                                halo: {
                                    size: 2
                                }
                            }
                        }
                    }
                },
                series: [{
                    name: 'load1',
                    // fillColor: 'yellow',
                    // fillOpacity: 0.15,
                    // data: []
                    data: (function () {
                        var data = [], time = Date.now(), i;
                        // try {
                        //     time = rpc.systemManager.getMilliseconds();
                        // } catch (e) {
                        //     console.log('Unable to get current millis.');
                        // }
                        time = Math.round(time/1000) * 1000;
                        for (i = -12; i <= 0; i += 1) {
                            data.push({
                                x: time + i * 10000,
                                y: null
                            });
                        }
                        return data;
                    }())
                }]
            });
        },

        addPoint: function () {
            if (!this.lineChart) {
                return;
            }
            var store = Ext.getStore('stats');
            var vm = this.getViewModel(),
                stats = store.first().getData(),
                medLimit = stats.numCpus + 1,
                highLimit = stats.numCpus + 4;

            this.lineChart.yAxis[0].update({
                minRange: stats.numCpus
            });
            var x = Date.now();
            this.lineChart.series[0].addPoint({
                x: x,
                y: store.first().getData().oneMinuteLoadAvg
            }, true, true);

            // this.lineChart.redraw();

            // if (stats.oneMinuteLoadAvg < medLimit) {
            //     vm.set('loadLabel', 'low'.t());
            // }
            // if (stats.oneMinuteLoadAvg > medLimit) {
            //     vm.set('loadLabel', 'medium'.t());
            // }
            // if (stats.oneMinuteLoadAvg > highLimit) {
            //     vm.set('loadLabel', 'high'.t());
            // }

        }
    }

});
