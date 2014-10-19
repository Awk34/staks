'use strict';

angular.module('staksApp')
    .service('HistoricalData', function ($q, $http) {
        return {
            /**
             * Delete access token and user info
             */
            getHistoricalData: function (security, fields, opts) {
                if(!security) return 1;
                else if(!fields) return 2;

                var options = {
                    startDate: 20140601,
                    endDate: 20140901
                };
                _.assign(options, opts);

                return $http.get('/api/blpapi/securities/'+security, { headers: { fields: JSON.stringify(fields), startDate: options.startDate, endDate: options.endDate } })
                    .success(function (res) {
                        return res;
                    })
                    .error(function (/*data, status, headers, config*/) {
                        return 3;
                    });
            }
        }
    });
