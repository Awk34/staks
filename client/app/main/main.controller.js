'use strict';

angular.module('staksApp')
    .controller('MainCtrl', function ($scope, $http, socket) {
        $scope.awesomeThings = [];
        $scope.loading = false;
        $scope.data = [];

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
                    renderGraph();
                    $scope.loading = false;
                })
                .error(function (data, status, headers, config) {
                    console.log(data);
                    $scope.loading = false;
                });
        };

        function renderGraph() {
            // Generate a Bates distribution of 10 random variables.
//            var values = d3.range(1000).map(d3.random.bates(10));
            var values = $scope.data;
            for (var i = 0; i < values.length; i++) {
                values[i] = values[i].OPEN;
            }

            // A formatter for counts.
            /*var formatCount = d3.format(",.0f");

            var margin = {top: 10, right: 30, bottom: 30, left: 30},
                width = 960 - margin.left - margin.right,
                height = 500 - margin.top - margin.bottom;

            var x = d3.scale.linear()
                .domain([0, 40])
                .range([0, width]);

            var y = d3.scale.linear()
                .domain([0, d3.max(data, function (d) {
                    return d.y;
                })])
                .range([height, 0]);

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

            var svg = d3.select("#dashboard-graphs").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");*/

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
                    .axisLabel("X-axis Label");

                chart.yAxis
                    .axisLabel("Y-axis Label")
                    .tickFormat(d3.format("d"));

                var svg = d3.select("#dashboard-graphs")
                    .append("svg");
                svg
                    .attr("height", "500px");
                svg
                    .datum(myData())
                    .transition().duration(500).call(chart);

                nv.utils.windowResize(
                    function () {
                        chart.update();
                    }
                );

                return chart;
            });
        }
    });
