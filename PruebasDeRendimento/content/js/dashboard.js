/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 0.0, "KoPercent": 100.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "Entrar al registro"], "isController": false}, {"data": [0.0, 500, 1500, "Solicitar reserva"], "isController": false}, {"data": [0.0, 500, 1500, "Registrarse"], "isController": false}, {"data": [0.0, 500, 1500, "Ir al apartado de mis reservas"], "isController": false}, {"data": [0.0, 500, 1500, "Cancelar la reserva"], "isController": false}, {"data": [0.0, 500, 1500, "Recibir notificación"], "isController": false}, {"data": [0.0, 500, 1500, "Ir a opcion de alquilar y escoger preferencias"], "isController": false}, {"data": [0.0, 500, 1500, "Rellenar fechas"], "isController": false}, {"data": [0.0, 500, 1500, "Recibir hoja de trabajo"], "isController": false}, {"data": [0.0, 500, 1500, "Rellenar preferencias"], "isController": false}, {"data": [0.0, 500, 1500, "Entrar nueva tarea"], "isController": false}, {"data": [0.0, 500, 1500, "Buscar estancias"], "isController": false}, {"data": [0.0, 500, 1500, "Obtener notificación"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 16, 16, 100.0, 1278.5000000000002, 2, 4090, 5.5, 4080.2, 4090.0, 4090.0, 0.7824343488679153, 0.8367329239816127, 0.06767025588048314], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Entrar al registro", 1, 1, 100.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 112.63020833333333, 41.341145833333336], "isController": false}, {"data": ["Solicitar reserva", 1, 1, 100.0, 4070.0, 4070, 4070, 4070.0, 4070.0, 4070.0, 4070.0, 0.2457002457002457, 0.6572001689189189, 0.0], "isController": false}, {"data": ["Registrarse", 1, 1, 100.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 113.93229166666666, 42.643229166666664], "isController": false}, {"data": ["Ir al apartado de mis reservas", 1, 1, 100.0, 4073.0, 4073, 4073, 4073.0, 4073.0, 4073.0, 4073.0, 0.24551927326295114, 0.6567161029953351, 0.0], "isController": false}, {"data": ["Cancelar la reserva", 1, 1, 100.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 85.693359375, 32.2265625], "isController": false}, {"data": ["Recibir notificación", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 172.8515625, 65.91796875], "isController": false}, {"data": ["Ir a opcion de alquilar y escoger preferencias", 2, 2, 100.0, 4083.0, 4076, 4090, 4083.0, 4090.0, 4090.0, 4090.0, 0.244140625, 0.6530284881591797, 0.0], "isController": false}, {"data": ["Rellenar fechas", 1, 1, 100.0, 5.0, 5, 5, 5.0, 5.0, 5.0, 5.0, 200.0, 67.3828125, 24.609375], "isController": false}, {"data": ["Recibir hoja de trabajo", 1, 1, 100.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 113.60677083333333, 42.317708333333336], "isController": false}, {"data": ["Rellenar preferencias", 2, 2, 100.0, 9.5, 6, 13, 9.5, 13.0, 13.0, 13.0, 0.4873294346978557, 0.16418813961988304, 0.05996436403508772], "isController": false}, {"data": ["Entrar nueva tarea", 1, 1, 100.0, 34.0, 34, 34, 34.0, 34.0, 34.0, 34.0, 29.41176470588235, 9.90923713235294, 3.6190257352941173], "isController": false}, {"data": ["Buscar estancias", 2, 2, 100.0, 3.5, 3, 4, 3.5, 4.0, 4.0, 4.0, 0.487685930260912, 0.1657370153621068, 0.06143699707388442], "isController": false}, {"data": ["Obtener notificación", 1, 1, 100.0, 4067.0, 4067, 4067, 4067.0, 4067.0, 4067.0, 4067.0, 0.24588148512417016, 0.6576849489795918, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 5, 31.25, 31.25], "isController": false}, {"data": ["404/Not Found", 11, 68.75, 68.75], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 16, 16, "404/Not Found", 11, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 5, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Entrar al registro", 1, 1, "404/Not Found", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Solicitar reserva", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Registrarse", 1, 1, "404/Not Found", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Ir al apartado de mis reservas", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Cancelar la reserva", 1, 1, "404/Not Found", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Recibir notificación", 1, 1, "404/Not Found", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Ir a opcion de alquilar y escoger preferencias", 2, 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Rellenar fechas", 1, 1, "404/Not Found", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Recibir hoja de trabajo", 1, 1, "404/Not Found", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Rellenar preferencias", 2, 2, "404/Not Found", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Entrar nueva tarea", 1, 1, "404/Not Found", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Buscar estancias", 2, 2, "404/Not Found", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Obtener notificación", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
