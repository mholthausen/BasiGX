/* Copyright (c) 2016-present terrestris GmbH & Co. KG
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 *  A container showing settings for the multisearch including switching
 *  gazetter or wfs search on and off, limit search results to visible extent
 *  and configure layers for wfs search.
 *  This class is used by BasiGX.view.form.field.MultiSearchCombo
 *
 * @class BasiGX.view.container.MultiSearchSettings
 *
 * @extends Ext.container.Container
 *
 * @requires BasiGX.util.Layer
 * @requires Ext.form.field.Checkbox
 * @requires Ext.form.FieldContainer
 * @requires Ext.Button
 *
 */
Ext.define('BasiGX.view.container.MultiSearchSettings', {
    extend: 'Ext.container.Container',
    xtype: 'basigx-container-multisearchsettings',

    requires: [
        'BasiGX.util.Layer',
        'Ext.form.field.Checkbox',
        'Ext.form.FieldContainer',
        'Ext.Button'
    ],

    viewModel: {
        data: {
            generalSettingsLabel: 'Allgemeine Einstellungen',
            limitCboxLabel: 'Auf den sichtbaren Kartenbereich einschränken',
            gazetteerLabel: 'Gazetteer Suche verwenden',
            objectSearchLabel: 'Objekt Suche verwenden',
            objectSearchLayersLabel: 'Layer für Objektsuche',
            saveBtnText: 'Sucheinstellungen speichern',
            documentation: '<h2>Multi-Suche</h2>• Benutzen Sie die ' +
                'Mutlisuche, um nach beliebigen Begriffen über mehrere ' +
                'Datenquellen hinweg gleichzeitig zu suchen.<br>• Über ' +
                'die Einstellungen können Sie das Suchverhalten genauer steuern'
        }
    },

    autoScroll: true,

    constrainHeader: true,

    padding: 20,

    width: 500,

    config: {
        combo: null
    },

    items: [{
        xtype: 'form',
        width: '100%',
        items: [
            {
                xtype: 'fieldcontainer',
                name: 'generalsettings',
                bind: {
                    fieldLabel: '{generalSettingsLabel}'
                },
                defaultType: 'checkboxfield',
                labelWidth: 200,
                items: [
                    {
                        bind: {
                            boxLabel: '{limitCboxLabel}'
                        },
                        labelWidth: 200,
                        name: 'limitcheckbox',
                        checked: true
                    }, {
                        bind: {
                            boxLabel: '{gazetteerLabel}'
                        },
                        labelWidth: 200,
                        name: 'gazetteersearch',
                        checked: true
                    }, {
                        bind: {
                            boxLabel: '{objectSearchLabel}'
                        },
                        labelWidth: 200,
                        name: 'objectsearch',
                        checked: true
                    }
                ]
            }, {
                xtype: 'fieldcontainer',
                name: 'objectlayers',
                bind: {
                    fieldLabel: '{objectSearchLayersLabel}'
                },
                defaultType: 'checkboxfield',
                labelWidth: 200
            }
        ]
    }, {
        xtype: 'button',
        bind: {
            text: '{saveBtnText}'
        },
        formBind: true,
        handler: function(btn) {
            var multisearchSettingsContainer = this.up();
            multisearchSettingsContainer.saveSettings(btn);
        }
    }],

    /**
    *
    */
    initComponent: function() {
        var me = this;

        me.callParent();

        me.setCombo(me.combo);

        me.on('beforerender', me.addLayers);
    },

    /**
     * Called by "save"-button handler to persist the settings.
     *
     * This includes switching the gazetter or wfs search on and off, limiting
     * search results to visible map extent and configuring search layers.
     *
     * @param {Ext.button.Button} btn The "save"-button.
     */
    saveSettings: function(btn) {
        var settingsContainer = btn.up();

        var win = settingsContainer.up();

        var form = settingsContainer.down('form');

        var combo = settingsContainer.getCombo();

        // set configured search layers to null and add the wanted below
        combo.setConfiguredSearchLayers([]);

        // set all configured values
        Ext.each(form.items.items, function(parentItem) {
            if (parentItem.name === 'generalsettings') {

                Ext.each(parentItem.items.items, function(item) {
                    if (item.name === 'objectsearch') {
                        combo.setWfsSearch(item.checked);
                    } else if (item.name === 'gazetteersearch') {
                        combo.setGazetteerSearch(item.checked);
                    } else if (item.name === 'limitcheckbox') {
                        combo.setLimitToBBox(item.checked);
                    }
                });

            } else if (parentItem.name === 'objectlayers') {

                Ext.each(parentItem.items.items, function(item) {
                    var l = BasiGX.util.Layer.getLayerByName(item.name);
                    if (this.checked) {
                        combo.configuredSearchLayers.push(l);
                    }
                });

            } else {
                Ext.log.error('Found setting for which no handler exists');
            }
        });

        win.setLoading(true);
        settingsContainer.combo.refreshSearchResults();
        win.setLoading(false);
        win.close();
    },

    /**
    * called by OnBeforerender listener to get all configurable search layers
    * to display them in the settings window
    */
    addLayers: function() {
        var me = this;

        var searchLayers = me.getCombo().getAllSearchLayers();

        var container = me.down('fieldcontainer[name="objectlayers"]');

        Ext.each(searchLayers, function(l) {
            var item = Ext.create('Ext.form.field.Checkbox', {
                labelWidth: 200,
                name: l.get('name'),
                boxLabel: l.get('name'),
                checked: true
            });

            container.add(item);

        });

    }

});
