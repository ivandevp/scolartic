/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 var db = null;
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent();
    },
    // Update DOM on a Received Event
    receivedEvent: function() {
        $("#search-form").submit(function(e) {
            e.preventDefault();
            var document_type = $("#document-type").val();
            var document_number = $("#document-number").val();
            if (document_type == 0) {
                $("#document-type").parent().addClass("has-error");
                navigator.notification.alert("Debe seleccionar el tipo de documento", null, "Scolartic", "Entendido");
            }
            else if (document_number == 0) {
                $("#document-number").parent().addClass("has-error");
                navigator.notification.alert("Debe ingresar el número de documento", null, "Scolartic", "Entendido =)");
            }
            else {
                if (document_type == 1 && document_number.length != 8) {
                    $("#document-number").parent().addClass("has-error");  
                    navigator.notification.alert("DNI debe tener 8 dígitos", null, "Scolartic", "Entendido =)");
                }
                else {
                    db = window.openDatabase("scolartic", "1.0", "Scolartic DB", 1000000);
                    db.transaction(function(tx) {
                        tx.executeSql('CREATE TABLE IF NOT EXISTS scolartic (dni unique, asistencia_jueves, asistencia_viernes, entrega_merchandising, entrega_usb)');
                        tx.executeSql('CREATE TABLE IF NOT EXISTS scolartic_error (log)');
                        tx.executeSql('SELECT * FROM scolartic where dni = ?', [document_number], app.querySuccess, app.errorDB);
                        tx.executeSql('SELECT * FROM scolartic_error', [], app.queryLogSuccess, app.errorDB);
                    }, app.errorDB, app.successDB);
                }
            }
        });
        $("#document-type").change(function(e) {
            var document_type = $(this).val();
            var parent_container = $(this).parent();
            if (document_type == 0) {
                if (!parent_container.hasClass("has-error")) $(this).parent().addClass("has-error");
            } else {
                if (parent_container.hasClass("has-error")) {
                    parent_container.removeClass("has-error");
                    parent_container.addClass("has-success");
                } else {
                    if (!parent_container.hasClass("has-success")) parent_container.addClass("has-success");
                }
                if (document_type == 1) {
                    $("#document-number").attr("max-length", 8);
                    $("#document-number").attr("min-length", 8);
                }
            }
            console.log($("#document-number").attr("max-length"));
            console.log($("#document-number").attr("min-length"));
        });
        $("#document-number").keyup(function(e) {
            var current_length = $(this).val().length;
            var document_type = $("#document-type").val();
            var parent_container = $(this).parent();
            if (document_type == 1) {
                if (current_length != 8) {
                    if (!parent_container.hasClass("has-error")) parent_container.addClass("has-error");
                }
                else {
                    if (parent_container.hasClass("has-error")) {
                        parent_container.removeClass("has-error");
                        parent_container.addClass("has-success");
                    }
                    else if (!parent_container.hasClass("has-success")) parent_container.addClass("has-success"); 
                }
            }
        });
        $(".update-action").click(function(e) {
            e.preventDefault();
            var id = $(this).attr("id");
            var span_id = "#" + id.replace("btn", "msg");
            var field = $(this).attr("data-field");
            var dni = $("#dni-searched").text();
            db.transaction(function(tx) {
                tx.executeSql('UPDATE scolartic set ' + field + ' =  ? where dni = ?', ["si", dni]);
            }, app.errorDB, function() {
                $("#" + id).addClass("hidden");
                if ($(span_id).hasClass("hidden")) $(span_id).removeClass("hidden");
            });
            
        });
        $("#exportData").click(function(e) {
            e.preventDefault();
            console.log("click");
            if (db == null) { db = window.openDatabase("scolartic", "1.0", "Scolartic DB", 1000000); }
            db.transaction(function(tx) {
                console.log("conexion abierta");
                tx.executeSql('SELECT * FROM scolartic', [], function(tx, results) {
                    console.log("ejecutando select");
                    window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {
                        console.log("dentro del fileSystem");
                        fileSystem.root.getFile("scolartic_data.txt",
                        {create: true, exclusive: false},
                        function(fileEntry) {
                            console.log("fileEntry");
                            fileEntry.createWriter(function(writer) {
                                console.log("writer");
                                var registry = "";
                                for (var i = results.rows.length - 1; i >= 0; i--) {
                                    registry += results.rows.item(i).dni + ", " + results.rows.item(i).asistencia_jueves + ", " +
                                                    results.rows.item(i).asistencia_viernes + ", " + results.rows.item(i).entrega_merchandising + ", " +
                                                    results.rows.item(i).entrega_usb + "\n";
                                    
                                }
                                console.log(registry);
                                writer.write(registry);
                                writer.onwriteend = function(evt) {
                                    console.log("terminóooo!!");
                                    console.log(evt);
                                    navigator.notification.alert("Exportación terminada", null, "Scolartic", "Genial =)");
                                }
                            }, app.fail);
                        }, app.fail);
                    }, app.fail);
                }, app.fail);
            }, app.errorDB, app.successDB);
        });
    },
    errorDB: function(err) {
        tx.executeSql('INSERT INTO scolartic_error (log) VALUES (' + err.message + ')');
    },
    successDB: function() {
        console.log("correctoooo!");
    },
    querySuccess: function(tx, results) {
        var existsUser = results.rows.length;
        var dni = $("#document-number").val();
        var asistencia_jueves = "no";
        var asistencia_viernes = "no";
        var entrega_merchandising = "no";
        var entrega_usb = "no";
        if (existsUser == 0) {
            tx.executeSql('INSERT INTO scolartic (dni, asistencia_jueves, asistencia_viernes, entrega_merchandising, entrega_usb) VALUES ("' + dni + '", "no", "no", "no", "no")');
        } else {
            asistencia_jueves = results.rows.item(0).asistencia_jueves;
            asistencia_viernes = results.rows.item(0).asistencia_viernes;
            entrega_merchandising = results.rows.item(0).entrega_merchandising;
            entrega_usb = results.rows.item(0).entrega_usb;
        }
        $("#dni-searched").text(dni);
        app.showAction(asistencia_jueves, "asist-jue");
        app.showAction(asistencia_viernes, "asist-vie");
        app.showAction(entrega_merchandising, "ent-mcd");
        app.showAction(entrega_usb, "ent-usb");
        var data_info = $("#data");
        if (data_info.hasClass("hidden")) data_info.removeClass("hidden");
    },
    queryLogSuccess: function(tx, results) {
        var errorCount = results.rows.length;
        console.log("Cant. Errores => " + errorCount);
        for (var i = 0; i < errorCount; i++) {
            console.log("Error: " +results.rows.item(i).log);
        };
    },
    showAction: function(element, id) {
        var btn_id = "#btn-" + id;
        var span_id = "#msg-" + id;
        if (element == "no") {
            if ($(btn_id).hasClass("hidden")) $(btn_id).removeClass("hidden");
            if (!$(span_id).hasClass("hidden")) $(span_id).addClass("hidden");
        } else {
            if (!$(btn_id).hasClass("hidden")) $(btn_id).addClass("hidden");
            if ($(span_id).hasClass("hidden")) $(span_id).removeClass("hidden");
        }
    },
    fail: function(error) {
        console.log(error);
        navigator.notification.alert(error.message, null, "Scolartic", "Avisar!");
    }
};