var app = angular.module('miner-dashboard', ['angularMoment']);

app.factory('dataService', function($http) {
  return {
    getWorkers: function() {
      return $http.get('/workers').then(function(result) {
        console.log("getWorkers data fetched");
        return result;
      });
    },
    getMiner: function() {
      return $http.get('/miners').then(function(result) {
        console.log("getMiner data fetched");
        return result;
      });
    },
    getWorkerRates: function() {
      return $http.get('/workerrates').then(function(result) {
        console.log("getWorkerRates");
        return result;
      });
    },
    getEthToUsd: function() {
      return $http.get('https://api.coinbase.com/v2/prices/ETH-USD/spot').then(function(result) {
        console.log("getEthToUsd data fetched");
        return result;
      })
    }
  }
});

app.controller('MinerDashboardController', function($scope, $http, dataService, moment) {
  dataService.getEthToUsd().then(function(response) {
    $scope.conversionRate = response.data.data.amount;
    return dataService.getMiner();
  }).then(function(response) {
    $scope.minerAddress = response.data[0].account_name;
    $scope.minerBalance = response.data[0].balance;
    $scope.minerShares = response.data[0].shares;
    return dataService.getWorkers();
  }).then(function(response) {
    $scope.workers = response.data;
    $scope.workers.map(function(worker) {
      worker.rates = [];
      worker.hours_active = 0;
      worker.hours_alive = 0;
      worker.percentOfMiner = Math.round((worker.total_shares / $scope.minerShares) * 1000) / 10;
      worker.total_eth = $scope.minerBalance * worker.percentOfMiner / 100;
      worker.total_usd = $scope.conversionRate * worker.total_eth;
      return worker;
    });
    return dataService.getWorkerRates();
  }).then(function(response) {
    var wrs = response.data; 
    wrs.map(function(wr) {
      $scope.workers[wr.workerId-1].rates.push(wr);
      $scope.workers[wr.workerId-1].hours_active = $scope.workers[wr.workerId-1].hours_active + (1/6);
      return wr;
    });

    $scope.workers.map(function(worker) {
      var start = moment.unix(parseInt(worker.rates[worker.rates.length-1].date));
      var end = moment();
      var duration = moment.duration(end.diff(start));
      var hours = duration.asHours();
      worker.hours_alive = hours;
      worker.ethperday = worker.total_eth / (worker.hours_alive / 24);
      worker.usdperday = worker.total_usd / (worker.hours_alive / 24);
    });

    console.log($scope.workers);

   // TODO: CHARTS / GRAPHS / PROGRESS BAR

    var chartWorkers = [];
    $scope.workers.map(function(worker) {
      var chartWorker = { name: worker.name, y: worker.percentOfMiner };
      chartWorkers.push(chartWorker);
    });

    // Radialize the colors
    Highcharts.setOptions({
        colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
            return {
                radialGradient: {
                    cx: 0.5,
                    cy: 0.3,
                    r: 0.7
                },
                stops: [
                    [0, color],
                    [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
                ]
            };
        })
    });

    // Build the chart
    Highcharts.chart('pieContainer', {
        exporting: { enabled: false },
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: ''
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: 'black',
                        fontSize: '12px'
                    },
                    connectorColor: 'silver'
                }
            }
        },
        series: [{
            name: '% of Total',
            data: chartWorkers
        }]
    });

    console.log($scope.workers);

    var chartData = [];
    $scope.workers.map(function(worker) {
      var o = {
        name: worker.name,
        data: [worker.total_eth]
      }
      chartData.push(o);
    });

    Highcharts.chart('barContainer', {
        exporting: { enabled: false },
        chart: {
            type: 'bar'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: ['']
        },
        yAxis: {
            min: 0,
            max: 0.2,
            title: {
                text: 'ETH'
            }
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            series: {
                stacking: 'normal'
            }
        },
        series: chartData
    });



  });



});


















