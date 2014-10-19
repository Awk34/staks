'use strict';

angular.module('staksApp')
    .controller('MainCtrl', function ($scope, $http, socket) {
        $scope.awesomeThings = [];
        $scope.loading = false;
        $scope.data = [];
        $scope.fortune500s = [];
        $scope.selected500 = undefined;

        loadJSON(function(response) {
            // Parse JSON string into object
            $scope.fortune500s = JSON.parse(response);
        });

        $http.get('/api/things').success(function (awesomeThings) {
            $scope.awesomeThings = awesomeThings;
            socket.syncUpdates('thing', $scope.awesomeThings);
        });

        $scope.addThing = function () {
            if ($scope.newThing === '') {
                return;
            }
            $http.post('/api/things', { name: $scope.newThing });
            $scope.newThing = '';
        };

        $scope.deleteThing = function (thing) {
            $http.delete('/api/things/' + thing._id);
        };

        $scope.$on('$destroy', function () {
            socket.unsyncUpdates('thing');
        });

        $scope.startSession = function () {
            $scope.loading = true;
            $http.get('/api/blpapi/start')
                .success(function (res) {
                    console.log(res);
                    $scope.loading = false;
                })
                .error(function (data, status, headers, config) {
                    console.log(data);
                    $scope.loading = false;
                });
        };

        $scope.grabData = function () {
            $scope.loading = true;
            $http.get('/api/blpapi')
                .success(function (res) {
                    console.log(res);
                    $scope.data = res[0].securityData.fieldData;
                    renderGraph($scope.data);
                    $scope.loading = false;
                })
                .error(function (data, status, headers, config) {
                    console.log(data);
                    $scope.loading = false;
                });
        };

        $scope.grabStock = function () {
            if($scope.selected500 == undefined) return;
            var stock = $scope.selected500.replace(/ /g, '_');
            $scope.loading = true;
            $http.get('/api/blpapi/stocks/'+stock)
                .success(function (res) {
                    console.log(res);
                    $scope.data = res.fieldData;
                    renderGraph($scope.data);
                    $scope.loading = false;
                    $scope.selected500 = undefined;
                })
                .error(function (data, status, headers, config) {
                    console.log(data);
                    $scope.loading = false;
                    $scope.selected500 = undefined;
                });
        };

        var pckry = new Packery( '#dashboard-root', {
            // options
            itemSelector: '.item',
            gutter: 10
        });

        function renderGraph(data) {
            var values = data;
            for (var i = 0; i < values.length; i++) {
                values[i] = values[i].OPEN;
            }

            function myData() {
                var series1 = [];
                var length = values.length;
                for(var i =1; i < length; i ++) {
                    series1.push({
                        x: i, y: values[i]
                    });
                }

                return [
                    {
                        key: "Series #1",
                        values: series1,
                        color: "#0000ff"
                    }
                ];
            }

            nv.addGraph(function () {
                var chart = nv.models.lineChart();

                chart.xAxis
                    .axisLabel("Time");

                chart.yAxis
                    .axisLabel("Price (USD)")
                    .tickFormat(d3.format("d"));

                var div = d3.select("#dashboard-root")
                    .append("div")
                    .attr("class", "item");
                var svg = div
                    .append("svg");
                svg.attr("height", "400px");
                svg.datum(myData())
                    .transition().duration(500).call(chart);

                nv.utils.windowResize(
                    function () {
                        chart.update();
                    }
                );

                pckry.addItems(div);

                return chart;
            });
        }
    });

function loadJSON(callback) {

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'assets/json/fortune500s.json', true);
    xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
        }
    };
    xobj.send(null);
}