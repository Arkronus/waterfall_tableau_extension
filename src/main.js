function loadWaterfall () {
    var chart = new CanvasJS.Chart("chartContainer", {
    theme: "light1", // "light1", "light2", "dark1", "dark2"
    animationEnabled: true,
    title: {
        text: "Отчетность"
    },
    axisY: {
        title: "Объем тыс. руб.",
        prefix: "",
        lineThickness: 0,
        suffix: ""
    },
    data: [{
        type: "waterfall",
        indexLabel: "{y}",
        indexLabelFontColor: "#EEEEEE",
        indexLabelPlacement: "inside",
        yValueFormatString: "#,##0k",
        dataPoints: [
            { label: "Продажи",  y: 1273 },
            { label: "Услуги", y: 623 },
            { label: "Общая выручка", isIntermediateSum: true, color: 'green'},
            { label: "Исследования", y: -150 },
            { label: "Маркетинг",  y: -226 },
            { label: "Зарплата", y: -632 },
            { label: "Операционная прибыль", isCumulativeSum: true },
            { label: "Налоги",  y: -264 },
            { label: "Чистая прибыль",  isCumulativeSum: true, color: 'green' }
        ]
        }]
    });
    chart.render();
}

function addListeners() {
    const dashboard = tableau.extensions.dashboardContent.dashboard;
    const worksheets = dashboard.worksheets;

    var worksheet = worksheets.find(function (sheet) {
      return sheet.name === "DataSource";
    });

    const filterChanged = tableau.TableauEventType.FilterChanged;

    worksheet.addEventListener(filterChanged, function (selectionEvent) {
      // When the selection changes, reload the data
        printData();
    })

}

function searchInArray(array, value){
    const reqPosition = array.find(function(val){
        return val[0] === value
    })
    return reqPosition[2] || 0
}

function prepareData(worksheetData){
    var accum = []

    worksheetData.forEach(function(row){
        accum.push( row.map(function(row){
            return row["_formattedValue"];            
            })
        );
    })

    const groupedData = _.groupBy(accum, row => row[1])
    var processedData = {}

    for (var i in groupedData){
        processedData[i] = {label: i, 
                            y: parseFloat(searchInArray(groupedData[i], "Сумма")),
                            isIntermediateSum: parseInt(searchInArray(groupedData[i], "Пром. сумма")) === 1  , 
                            isCumulativeSum: parseInt(searchInArray(groupedData[i], "Накоп. сумма")) === 1}
    }

    return processedData;

}

function printData(){
    const dashboard = tableau.extensions.dashboardContent.dashboard;
    const worksheets = dashboard.worksheets;

    var worksheet = worksheets.find(function (sheet) {
      return sheet.name === "DataSource";
    });

    worksheet.getSummaryDataAsync().then(function (sumdata) {

        const worksheetData = sumdata.data.reverse();
        const readyData = prepareData(worksheetData);
        $("#groupedData").append(JSON.stringify(readyData));
  

    });
}



$(document).ready(function () {
    tableau.extensions.initializeAsync().then(function () {
      loadWaterfall();
      addListeners();
      printData();
    }, function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });
});





