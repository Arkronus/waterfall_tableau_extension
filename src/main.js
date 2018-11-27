function loadWaterfall () {
    var chart = new CanvasJS.Chart("chartContainer", {
    theme: "light1", // "light1", "ligh2", "dark1", "dark2"
    animationEnabled: true,
    title: {
        text: "Company Finance"
    },
    axisY: {
        title: "Amount (in USD)",
        prefix: "$",
        lineThickness: 0,
        suffix: "k"
    },
    data: [{
        type: "waterfall",
        indexLabel: "{y}",
        indexLabelFontColor: "#EEEEEE",
        indexLabelPlacement: "inside",
        yValueFormatString: "#,##0k",
        dataPoints: [
            { label: "Sales",  y: 1273 },
            { label: "Service", y: 623 },
            { label: "Total Revenue", isIntermediateSum: true},
            { label: "Research", y: -150 },
            { label: "Marketing",  y: -226 },
            { label: "Salaries", y: -632 },
            { label: "Operating Income", isCumulativeSum: true },
            { label: "Taxes",  y: -264 },
            { label: "Net Income",  isCumulativeSum: true }
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

    const markSelection = tableau.TableauEventType.FilterChanged;

    worksheet.addEventListener(markSelection, function (selectionEvent) {
      // When the selection changes, reload the data
        printData();
    })

}

function printData(){
    const dashboard = tableau.extensions.dashboardContent.dashboard;
    const worksheets = dashboard.worksheets;

    var worksheet = worksheets.find(function (sheet) {
      return sheet.name === "DataSource";
    });

    worksheet.getSummaryDataAsync().then(function (sumdata) {
    const worksheetData = sumdata;
    
        // The getSummaryDataAsync() method returns a DataTable
        // Map the DataTable (worksheetData) into a format for display, etc.
    // $("div#data").html("<p>DataSource Hello world</p>")
    $("#data").html(worksheetData.totalRowCount)
    
    });
}

$(document).ready(function () {
    tableau.extensions.initializeAsync().then(function () {
      loadWaterfall();
      printData();
      addListeners();
    }, function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });
});

function filterChangedHandler (filterEvent) {
    // Just reconstruct the filters table whenever a filter changes.
    // This could be optimized to add/remove only the different filters.
    printData();
}



