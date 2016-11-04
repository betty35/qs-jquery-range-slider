/*
 *@title 		jQuery Range Slider for Qlik Sense(v3)
 *@version 		0.8.0
 *@example		https://github.com/betty35/my-qlik-tools-catalog
 *@description 	This is a rank/value range slider modified from Stefan Stoichev's jQuery Slider for multiple selection (https://github.com/countnazgul/jQuery-Slider)
 *
 *Copyright (c) 2015 Stefan Stoichev---------MIT Licensed
 *Copyright (c) 2016 Bingqing Zhao(betty352008@yeah.net)--------MIT Licensed
 *
*/
define(["qlik", "jquery", './js/bootstrap.min', "text!./css/style.css", 'text!./css/jquery-ui.css', 'text!./css/scoped-bootstrap.css'],
	function (qlik, $, bootstrap, cssContent, jqueryUI, bootstrapCss) {
	'use strict';
	$("<style>").html(cssContent).appendTo("head");
	$('<style>').html(bootstrapCss).appendTo('head');
	$('<style>').html(jqueryUI).appendTo('head');
	
	return {
		initialProperties: {
			qListObjectDef: {
				qShowAlternatives: true,
				qInitialDataFetch: [{
					qWidth: 1,
					qHeight: 1500
				}]
			}
		},
		definition: {
			type: "items",
			component: "accordion",
			items: {
				dimension: {
					type: "items",
					label: "Dimensions",
					ref: "qListObjectDef",
					min: 1,
					max: 1,
					items: {
						label: {
							type: "string",
							ref: "qListObjectDef.qDef.qFieldLabels.0",
							label: "Label",
							show: true
						},
						libraryId: {
							type: "string",
							component: "library-item",
							libraryItemType: "dimension",
							ref: "qListObjectDef.qLibraryId",
							label: "Dimension",
							show: function (data) {
								return data.qListObjectDef && data.qListObjectDef.qLibraryId;
							}
						},
						field: {
							type: "string",
							expression: "always",
							expressionType: "dimension",
							ref: "qListObjectDef.qDef.qFieldDefs.0",
							label: "Field",
							show: function (data) {
								return data.qListObjectDef && !data.qListObjectDef.qLibraryId;
							}
						}
						
					}
				},	
				settings: {
					uses: "settings"
				}
			}
		},
		snapshot: {
			canTakeSnapshot: true
		},
		paint: function ($element, layout) {

			var app = qlik.currApp(this);
			var field = layout.qListObject.qDimensionInfo.qFallbackTitle;
			var data = layout.qListObject.qDataPages[0].qMatrix;
			var posVal = [];
			data.sort(
			function(a,b){
				var a1=parseInt(a[0].qText);
				var b1=parseInt(b[0].qText);
				if(a1<b1) return -1;
				else if(a1>b1) return 1;
				else return 0;
			});

			var selected_max_pos=0;
			var selected_min_pos= data.length;
			
			for (var i = 0; i < data.length; i++) {
				if (data[i][0].qState != "X" && data[i][0].qState != "A") 
				{
					if(i>selected_max_pos)
						selected_max_pos=i;
					if(i<selected_min_pos)
						selected_min_pos=i;
				}
					var p1=parseInt(data[i][0].qElemNumber);
					var val1=parseInt(data[i][0].qText);
					posVal.push({position:p1,value:val1});
			}

			var self = this //, html = "<ul>";
			var html = '<div style="margin: 15px; padding: 25px"> <div id="slider-range"></div> </div> <span id="sliderMsg"></span>'
			var sliderData = [];
			for (var i = 0; i < data.length; i++) {
				sliderData.push(data[i][0].qText);
			}
			
			
			function create(event, ui, start, end) {
				var handles = $(event.target).find('span');
				handles.eq(0).tooltip({
					animation: false,
					placement: 'top',
					trigger: 'manual',
					container: handles.eq(0),
					title: start
				}).tooltip('show');
				handles.eq(1).tooltip({
					animation: false,
					placement: 'bottom',
					trigger: 'manual',
					container: handles.eq(1),
					title: end
				}).tooltip('show');
			}

			$element.html(html);
			$("#slider-range").slider({
				range: true,
				min: 0,
				max: data.length - 1,
				values:[selected_min_pos,selected_max_pos],
				stop: function (event, ui) {
					var toSelect = []
					for (var i = ui.values[0]; i < ui.values[1] + 1; i++) {
						toSelect.push(posVal[i].position);
					}

					setTimeout(function () {
						$(ui.handle).attr('title', sliderData[ui.value]).tooltip('fixTitle').tooltip('show');
					}, 5);

					self.backendApi.selectValues(0, toSelect, false);
				},
				slide: function (event, ui) {
					setTimeout(function () {
						$(ui.handle).attr('title', sliderData[ui.value]).tooltip('fixTitle').tooltip('show');
					}, 5);
				},
				change: function (event, ui) {
				},
				create: function (event, ui) {
					create(event, ui, $(this).slider('values', 0), $(this).slider('values', 1))
				}
			});	
		}
	};
});
