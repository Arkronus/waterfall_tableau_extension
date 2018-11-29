$(document).ready(function () {
    tableau.extensions.initializeAsync().then(function () {
      updateWaterfall();
      addListeners();
    }, function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });
});

function buildWaterfall(waterfallData) {

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
        dataPoints: waterfallData
        }]
    });
    chart.render();
}

function updateWaterfall(){
    const worksheet = getWorksheetByName("DataSource");
    worksheet.getSummaryDataAsync().then(function(sheetdata){
        worksheetData = sheetdata.data.reverse();
        var accum = []
        worksheetData.forEach(function(row){
            accum.push( row.map(function(row){
                return row["_formattedValue"];            
                })
            );
        })
        const groupedData = _.groupBy(accum, row => row[1])
        var processedData = [];
        for (var i in groupedData){
            processedData.push({label: i, 
                                y: parseNumber(searchInArray(groupedData[i], "Сумма")),
                                isIntermediateSum: parseInt(searchInArray(groupedData[i], "Пром. сумма")) === 1, 
                                isCumulativeSum: parseInt(searchInArray(groupedData[i], "Накоп. сумма")) === 1})
        }

        buildWaterfall(processedData);
    },

    function(err){
        console.log(err);
    });
}


function addListeners() {
    const worksheet = getWorksheetByName("DataSource");
    const filterChanged = tableau.TableauEventType.FilterChanged;

    worksheet.addEventListener(filterChanged, function (selectionEvent){
      // When the selection changes, reload the data
        updateWaterfall();
    });
}

// utility functions

function searchInArray(array, value){
    const reqPosition = array.find(function(val){
        return val[0] === value
    })
    return reqPosition[2] || 0
}

function parseNumber(numberAsString){
    const trimmedString = numberAsString.replace(/\s/g, '')
    return parseFloat(trimmedString)
}

function getWorksheetByName(sheetName){
    const dashboard = tableau.extensions.dashboardContent.dashboard;
    const worksheets = dashboard.worksheets;

    var worksheet = worksheets.find(function (sheet) {
      return sheet.name === "sheetName";
    });

    return worksheet;
};