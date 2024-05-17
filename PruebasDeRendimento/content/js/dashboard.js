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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 42500, 42500, 100.0, 0.7082352941176479, 0, 64, 1.0, 1.0, 2.0, 3.0, 434.21402153701547, 1115.3423697741066, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Entrar al registro", 3000, 3000, 100.0, 0.6996666666666663, 0, 10, 1.0, 1.0, 2.0, 3.0, 50.23779221649139, 129.0777649624891, 0.0], "isController": false}, {"data": ["Solicitar reserva", 3000, 3000, 100.0, 0.7039999999999998, 0, 26, 1.0, 1.0, 2.0, 3.0, 50.22349455075084, 128.94293669328513, 0.0], "isController": false}, {"data": ["Registrarse", 3000, 3000, 100.0, 0.6873333333333325, 0, 28, 1.0, 1.0, 2.0, 3.0, 50.23947483002311, 129.0820881619051, 0.0], "isController": false}, {"data": ["Ir al apartado de mis reservas", 3000, 3000, 100.0, 0.7153333333333327, 0, 64, 1.0, 1.0, 2.0, 3.0, 50.233586175717086, 128.96884575777366, 0.0], "isController": false}, {"data": ["Cancelar la reserva", 3000, 3000, 100.0, 0.6773333333333337, 0, 8, 1.0, 1.0, 2.0, 3.0, 50.23526850751017, 129.07128070630787, 0.0], "isController": false}, {"data": ["Recibir notificación", 3000, 3000, 100.0, 0.6913333333333355, 0, 20, 1.0, 1.0, 2.0, 3.0, 50.23695095199022, 129.0756034713733, 0.0], "isController": false}, {"data": ["Ir a opcion de alquilar y escoger preferencias", 6000, 6000, 100.0, 0.742999999999999, 0, 48, 1.0, 1.0, 2.0, 3.0, 100.33109260559847, 257.58832271495936, 0.0], "isController": false}, {"data": ["Rellenar fechas", 3000, 3000, 100.0, 0.7010000000000003, 0, 13, 1.0, 1.0, 2.0, 3.0, 50.22517620665986, 129.0453501950411, 0.0], "isController": false}, {"data": ["Recibir hoja de trabajo", 250, 250, 100.0, 0.7, 0, 4, 1.0, 1.0, 2.0, 2.490000000000009, 2.555583950932788, 6.566153686429849, 0.0], "isController": false}, {"data": ["Rellenar preferencias", 6000, 6000, 100.0, 0.7090000000000004, 0, 40, 1.0, 1.0, 2.0, 3.0, 100.42009071281528, 258.01294791544626, 0.0], "isController": false}, {"data": ["Entrar nueva tarea", 250, 250, 100.0, 0.9400000000000014, 0, 48, 1.0, 1.0, 2.0, 3.490000000000009, 2.5542001266883263, 6.562598177067369, 0.0], "isController": false}, {"data": ["Buscar estancias", 6000, 6000, 100.0, 0.7051666666666674, 0, 16, 1.0, 1.0, 2.0, 3.0, 100.42345222354261, 258.02158476576227, 0.0], "isController": false}, {"data": ["Obtener notificación", 3000, 3000, 100.0, 0.7063333333333338, 0, 11, 1.0, 1.0, 2.0, 3.0, 50.22938083916553, 128.9580490489904, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 15000, 35.294117647058826, 35.294117647058826], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8181 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 27500, 64.70588235294117, 64.70588235294117], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 42500, 42500, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8181 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 27500, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 15000, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Entrar al registro", 3000, 3000, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8181 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 3000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Solicitar reserva", 3000, 3000, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 3000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Registrarse", 3000, 3000, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8181 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 3000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Ir al apartado de mis reservas", 3000, 3000, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 3000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Cancelar la reserva", 3000, 3000, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8181 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 3000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Recibir notificación", 3000, 3000, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8181 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 3000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Ir a opcion de alquilar y escoger preferencias", 6000, 6000, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 6000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Rellenar fechas", 3000, 3000, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8181 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 3000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Recibir hoja de trabajo", 250, 250, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8181 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 250, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Rellenar preferencias", 6000, 6000, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8181 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 6000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Entrar nueva tarea", 250, 250, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8181 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 250, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Buscar estancias", 6000, 6000, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:8181 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 6000, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Obtener notificación", 3000, 3000, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:80 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 3000, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
