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
            console.log(document_type);
            console.log(document_number);
            if (document_type == 0) navigator.notification.alert("Debe seleccionar el tipo de documento", null, "Scolartic", "Entendido =)");
            else if (document_number == 0) navigator.notification.alert("Debe ingresar el número de documento", null, "Scolartic", "Entendido =)");
            else {
                console.log("jksasa");
                var db = window.openDatabase("scolartic", "1.0", "Scolartic DB", 1000000);
                console.log("jasjksa");
                db.transaction(app.populateDB, app.errorDB, app.successDB);
            }
        });
    },
    populateDB: function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS scolartic (dni unique, asistencia_jueves, asistencia_viernes, entrega_merchandising, entrega_usb)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS scolartic_error (log)');
        tx.executeSql('SELECT * FROM scolartic', [], app.querySuccess, app.errorDB);
        tx.executeSql('SELECT * FROM scolartic_error', [], app.queryLogSuccess, app.errorDB);
        console.log("jbjkasasklnsklf");
        
    },
    errorDB: function(err) {
        console.log(err);
        console.log("erroooor!");
        tx.executeSql('INSERT INTO scolartic_error (log) VALUES (' + err.message + ')');
        console.log(err.code);
    },
    successDB: function() {
        console.log("correctoooo!");
    },
    querySuccess: function(tx, results) {
        console.log("query success!!");
        var existsUser = results.rows.length;
        if (existsUser > 0) {
            navigator.notification.alert("Usuario existe", null, "Scolartic", "Wiii");
        } else {
            var dni = $("#document-number").val();
            console.log(dni);
            tx.executeSql('INSERT INTO scolartic (dni, asistencia_jueves, asistencia_viernes, entrega_merchandising, entrega_usb) VALUES ("' + dni + '", "no", "no", "no", "no")');
            console.log("se insertoooo!!");
        }
    },
    queryLogSuccess: function(tx, results) {
        var errorCount = results.rows.length;
        console.log("Cant. Errores => " + errorCount);
        for (var i = 0; i < errorCount; i++) {
            console.log("Error: " +results.rows.item(i).log);
        };
    }
};