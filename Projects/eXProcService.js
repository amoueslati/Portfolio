(function (app) {
    app.service('eXProcService', function ($q, $filter, $window) {

        this.serviceUrl = 'http://midtier8/eXProcService/eXProcService.svc/api';
        this.configMode = ($window.location.href.indexOf('.sportskiapps.local') > -1) ? 'Live' : 'Live';
        this.applicationName = 'Inventory';

        this.executeProcedure = function (procId, paramValues, columns, expandFirstTable) {

            var d = $q.defer();
            $.ajax({
                type: "POST",
                url: String.format('{0}/Execute', this.serviceUrl),
                contentType: 'application/json',
                accept: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    "ProcedureId": procId,
                    "ConfigMode": this.configMode,
                    "ApplicationName": this.applicationName,
                    "Parameters": paramValues,
                    "Columns": columns
                }),
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                success: function (result) {
                    if (!result.StatusMessage) {
                        d.resolve(expandFirstTable ? result.Tables[0] : result.Tables);
                    } else {
                        d.reject(result.StatusMessage);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    d.reject('Request failed. ' + errorThrown);
                }
            });
            return d.promise;
        }

        this.executeBatch = function (procId, batchParams, columns, expandFirstTable) {

            var d = $q.defer();
            $.ajax({
                type: "POST",
                url: String.format('{0}/ExecuteBatch', this.serviceUrl),
                contentType: 'application/json',
                accept: 'application/json',
                dataType: 'json',
                data: JSON.stringify({
                    "ProcedureId": procId,
                    "ConfigMode": this.configMode,
                    "ApplicationName": this.applicationName,
                    "BatchParameters": batchParams,
                    "Columns": columns
                }),
                crossDomain: true,
                xhrFields: {
                    withCredentials: true
                },
                success: function (result) {
                    if (!result.StatusMessage) {
                        d.resolve(expandFirstTable ? result.Results[0].Tables[0] : result.Results);
                    } else {
                        d.reject(result.StatusMessage);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    d.reject('Request failed. ' + errorThrown);
                }
            });
            return d.promise;
        }
    });
}(angular.module('Inventory')));