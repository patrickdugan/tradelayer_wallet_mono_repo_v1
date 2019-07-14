webpackJsonp([8,12],{1077:function(e,t,i){"use strict";function a(e,t,i){r.call(this,e,t),this._linetool=i,this.prepareLayout()}var o=i(239),r=o.PropertyPage,n=o.GreateTransformer,s=o.LessTransformer,l=o.ToIntTransformer,p=o.SimpleStringBinder;i(242),inherit(a,r),a.BarIndexPastLimit=-5e4,a.BarIndexFutureLimit=15e3,a.prototype.bindBarIndex=function(e,t,i,o){var r=[l(e.value()),n(a.BarIndexPastLimit),s(a.BarIndexFutureLimit)];this.bindControl(this.createStringBinder(t,e,r,!0,i,o))},a.prototype.createPriceEditor=function(e){var t,i,a,o=this._linetool,r=o.ownerSource().formatter(),n=function(e){return r.format(e)},s=function(e){var t=r.parse(e);if(t.res)return t.price?t.price:t.value},l=$("<input type='text'>");return l.TVTicker({step:r._minMove/r._priceScale||1,formatter:n,parser:s}),e&&(t=[function(t){var i=s(t);return void 0===i?e.value():i}],i="Change "+o.title()+" point price",a=this.createStringBinder(l,e,t,!1,this.model(),i),a.addFormatter(function(e){return r.format(e)}),this.bindControl(a)),l},a.prototype._createPointRow=function(e,t,i){var a,o,r,n,s,l=$("<tr>"),p=$("<td>");return p.html($.t("Price")+i),p.appendTo(l),a=$("<td>"),a.appendTo(l),o=this.createPriceEditor(t.price),o.appendTo(a),r=$("<td>"),r.html($.t("Bar #")),r.appendTo(l),n=$("<td>"),n.appendTo(l),s=$("<input type='text'>"),s.appendTo(n),s.addClass("ticker"),this.bindBarIndex(t.bar,s,this.model(),"Change "+this._linetool.title()+" point bar index"),l},a.prototype.prepareLayoutForTable=function(e){var t,i,a,o,r,n=this._linetool.points(),s=n.length;for(t=0;t<n.length;t++)i=n[t],(a=this._linetool.properties().points[t])&&(o=t||s>1?" "+(t+1):"",r=this._createPointRow(i,a,o),r.appendTo(e))},a.prototype.prepareLayout=function(){this._table=$(document.createElement("table")),this._table.addClass("property-page"),this._table.attr("cellspacing","0"),this._table.attr("cellpadding","2"),this.prepareLayoutForTable(this._table),this.loadData()},a.prototype.widget=function(){return this._table},a.prototype.createStringBinder=function(e,t,i,a,o,r){return new p(e,t,i,a,o,r)},e.exports=a},1078:function(e,t,i){"use strict";t.createInputsPropertyPage=function(e,t){var i=e.getInputsPropertyPage();return null==i?null:new i(e.properties(),t,e)},t.createStudyStrategyPropertyPage=function(e,t){var i=e.getStrategyPropertyPage();return null==i?null:new i(e.properties(),t,e)},t.createStylesPropertyPage=function(e,t){var i=e.getStylesPropertyPage();return null==i?null:new i(e.properties(),t,e)},t.createDisplayPropertyPage=function(e,t){var i=e.getDisplayPropertyPage();return null==i?null:new i(e.properties(),t,e)},t.createVisibilitiesPropertyPage=function(e,t){var i=e.getVisibilitiesPropertyPage();return null==i?null:new i(e.properties(),t,e)},t.hasInputsPropertyPage=function(e){return null!==e.getInputsPropertyPage()},t.hasStylesPropertyPage=function(e){return null!==e.getStylesPropertyPage()}},1196:function(e,t,i){"use strict";function a(e){function t(t,i,a){e.call(this,t,i,a),this._linetool=a,
this._templateList=new p(this._linetool._constructor,this.applyTemplate.bind(this))}return inherit(t,e),t.prototype.applyTemplate=function(e){this.model().applyLineToolTemplate(this._linetool,e,"Apply Drawing Template"),this.loadData()},t.prototype.createTemplateButton=function(e){var t=this;return e=$.extend({},e,{getDataForSaveAs:function(){return t._linetool.template()}}),this._templateList.createButton(e)},t}function o(e,t,i){n.call(this,e,t),this._linetool=i}var r=i(239),n=r.PropertyPage,s=r.ColorBinding,l=i(373).addColorPicker,p=i(386);inherit(o,n),o.prototype.createOneColorForAllLinesWidget=function(){var e=$("<td class='colorpicker-cell'>");return this.bindControl(new s(l(e),this._linetool.properties().collectibleColors,!0,this.model(),"Change All Lines Color",0)),{label:$("<td>"+$.t("Use one color")+"</td>"),editor:e}},o.prototype.addOneColorPropertyWidget=function(e){var t=this.createOneColorForAllLinesWidget(),i=$("<tr>");i.append($("<td>")).append(t.label).append(t.editor),i.appendTo(e)},o=a(o),o.createTemplatesPropertyPage=a,e.exports=o},1202:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e){e[e.Coordinates=100]="Coordinates",e[e.Display=100]="Display",e[e.Style=200]="Style",e[e.Inputs=300]="Inputs",e[e.Properties=250]="Properties"}(t.TabPriority||(t.TabPriority={})),function(e){e.background="Background",e.coordinates="Coordinates",e.drawings="Drawings",e.events="Events",e.eventsAndAlerts="Events & Alerts",e.inputs="Inputs",e.properties="Properties",e.scales="Scales",e.sourceCode="Source Code",e.style="Style",e.timezoneSessions="Timezone/Sessions",e.trading="Trading",e.visibility="Visibility"}(t.TabNames||(t.TabNames={})),function(e){e[e.Default=100]="Default",e[e.UserSave=200]="UserSave",e[e.Override=300]="Override"}(t.TabOpenFrom||(t.TabOpenFrom={}))},413:function(e,t,i){"use strict";(function(t){function a(e,t,i){this._source=e,this._model=t,this._undoCheckpoint=i}var o=i(1).LineDataSource,r=i(35).Study,n=i(77),s=i(46).DataSource,l=i(23),p=i(133).bindPopupMenu,c=i(1202),d=i(40).trackEvent;i(242),a.prototype.hide=function(e){TVDialogs.destroy(this._dialogTitle,{undoChanges:!!e})},a.prototype._onDestroy=function(e,t){var i,a,o=(t||{}).undoChanges;$(window).unbind("keyup.hidePropertyDialog"),o?(i=this._undoCheckpoint?this._undoCheckpoint:this._undoCheckpointOnShow)&&this._model.undoToCheckpoint(i):this._source.hasAlert.value()&&(a=this._source,setInterval(function(){a.localAndServerAlersMismatch&&a.synchronizeAlert(!0)})),this._undoCheckpointOnShow&&delete this._undoCheckpointOnShow,window.lineToolPropertiesToolbar&&window.lineToolPropertiesToolbar.refresh()},a.prototype.isVisible=function(){return this._dialog&&this._dialog.is(":visible")},a.prototype.focusOnText=function(){this._dialog.find('input[type="text"]').focus().select()},a.prototype.switchTab=function(e,t){var i,a;if(this._tabs)return i=null,e?e=e.valueOf():null===e&&(e=void 0),"string"==typeof e&&$.each(this._tabs,function(t,a){if(a.name===e)return i=a,!1}),
"object"==typeof e&&$.each(this._tabs,function(t,a){if(e===a||$(a.labelObject).is(e)||$(a.wrapperObject).is(e))return i=a,!1}),i||(i=this._tabs[~~e]),!!i&&($.each(this._tabs,function(e,t){var a=t===i;$(t.wrapperObject)[a?"show":"hide"](),$(t.labelObject)[a?"addClass":"removeClass"]("active")}),t&&(a=this.activeTabSettingsName())&&TVSettings.setValue(a,i.name),this._dialog.height()+100>$(window).height()&&!i.isScrollable&&this.makeScrollable(i),$(":focus").blur(),!0)},a.prototype.makeScrollable=function(e){var t=e.wrapperObject,i=$(e.objects[0]),a=i.width();t.css({height:$(window).height()/1.4,overflow:"auto"}),i.css("width",a+20),e.isScrollable=!0},a.prototype.appendToTab=function(e,t,i,a,o,r){var n,s;$(e).is("table")&&!$(e).find("tr").size()||(this._tabs||(this._tabs=[]),$.each(this._tabs,function(e,i){if(i.name===t)return n=e,!1}),void 0===n&&(this._tabs.push({name:t,localizedName:$.t(t),objects:$(),displayPriority:0,defaultOpen:0,isButton:!!o,callback:o?r||function(){}:null}),n=this._tabs.length-1),s=this._tabs[n],s.objects=s.objects.add(e),s.displayPriority=Math.max(s.displayPriority||0,i||0),s.defaultOpen=Math.max(s.defaultOpen||0,a||0))},a.prototype.insertTabs=function(){function e(e){r&&r===e.name&&(e.defaultOpen=Math.max(~~e.defaultOpen,c.TabOpenFrom.UserSave)),(!a||~~a.defaultOpen<~~e.defaultOpen)&&(a=e),e.labelObject=$('<a href="#" class="properties-tabs-label tv-tabs__tab"></a>').text(e.localizedName).appendTo(i._tabContainer),e.labelObject.bind("click",function(e){e.preventDefault(),i.switchTab(this,!0)});var t=$('<div class="main-properties"></div>');e.wrapperObject=$().add(t),e.objects.each(function(i,a){var o=$(a);o.is("table")?(o.data("layout-separated")&&(e.wrapperObject=e.wrapperObject.add('<div class="properties-separator"></div>').add(t=$('<div class="main-properties"></div>')),o.removeData("layout-separated")),t.append(o),o.children("tbody").each(function(i,o){if(0!==i&&$(o).data("layout-separated")){e.wrapperObject=e.wrapperObject.add('<div class="properties-separator"></div>').add(t=$('<div class="main-properties"></div>'));var r=$(a).clone(!0,!1).appendTo(t);r.children().remove(),r.append(o),$(o).removeData("layout-separated")}})):t.append(o)}),e.wrapperObject.appendTo(i._container)}function t(e){e.labelObject=$('<a href="#" class="properties-tabs-label tv-tabs__tab"></a>').text(e.localizedName).appendTo(i._tabContainer),e.labelObject.bind("click",e.callback)}var i,a,o,r;this._tabs&&(this._tabs.sort(function(e,t){return(t.displayPriority||0)-(e.displayPriority||0)}),i=this,a=null,o=this.activeTabSettingsName(),o&&(r=TVSettings.getValue(o)),$.each(this._tabs,function(i,a){a.isButton?t(a):e(a)}),this.switchTab(a))},a.prototype.activeTabSettingsName=function(){var e=this._source;if(e)return e instanceof n?"properties_dialog.active_tab.chart":e instanceof o?"properties_dialog.active_tab.drawing":e instanceof r?"properties_dialog.active_tab.study":void 0},a.prototype.show=function(e){function a(){T.hide(!0)}var u,h,b,f,y,_,g,T,m,v,P,w,S,C,D,O,k,I,x,j,N,V,L,B,z
;if(t.enabled("property_pages")&&(u=i(1078),e=e||{},h=e.onWidget||!1,TradingView.isInherited(this._source.constructor,n)&&d("GUI","Series Properties"),TradingView.isInherited(this._source.constructor,r)&&d("GUI","Study Properties"),TradingView.isInherited(this._source.constructor,s)&&this._model.setSelectedSource(this._source),b=u.createStudyStrategyPropertyPage(this._source,this._model),f=u.createInputsPropertyPage(this._source,this._model),y=u.createStylesPropertyPage(this._source,this._model),_=u.createVisibilitiesPropertyPage(this._source,this._model),g=u.createDisplayPropertyPage(this._source,this._model),f&&!f.widget().is(":empty")||y||b))return T=this,m=null!==f,v=this._source.title(),P=TVDialogs.createDialog(v,{hideTitle:!0,dragHandle:".properties-tabs"}),w=P.find("._tv-dialog-content"),S=$('<div class="properties-tabs tv-tabs"></div>').appendTo(w),D=[],O=400,this._tabs=D,this._dialog=P,this._dialogTitle=v,this._container=w,this._tabContainer=S,this._undoCheckpointOnShow=this._model.createUndoCheckpoint(),P.on("destroy",function(e,t){var t=t||{};T._onDestroy(e,t),C&&(t.undoChanges?C.restore():C.applyTheme()),f&&f.destroy(),b&&b.destroy(),y&&y.destroy(),g&&g.destroy(),_&&_.destroy(),$("select",w).each(function(){$(this).selectbox("detach")})}),e.selectScales&&y.setScalesOpenTab&&y.setScalesOpenTab(),e.selectTmz&&y.setTmzOpenTab&&y.setTmzOpenTab(),!this._model.readOnly()&&b&&b.widget().each(function(e,t){var i,a,o=+$(t).data("layout-tab-priority");isNaN(o)&&(o=c.TabPriority.Properties),i=~~$(t).data("layout-tab-open"),a=$(t).data("layout-tab"),void 0===a&&(a=c.TabNames.properties),T.appendToTab(t,a,o,i)}),this._model.readOnly()||!m||f.widget().is(":empty")||f.widget().each(function(e,t){var a,o,r=i(1077),n=f instanceof r,s=+$(t).data("layout-tab-priority");TradingView.isNaN(s)&&(s=n?c.TabPriority.Coordinates:c.TabPriority.Inputs),a=~~$(t).data("layout-tab-open"),o=$(t).data("layout-tab"),void 0===o&&(o=n?c.TabNames.coordinates:c.TabNames.inputs),T.appendToTab(t,o,s,a)}),y&&y.widget().each(function(e,t){var a,o,r,n=+$(t).data("layout-tab-priority");TradingView.isNaN(n)&&(n=c.TabPriority.Style),a=~~$(t).data("layout-tab-open"),o=i(1196),!a&&y instanceof o&&(a=c.TabOpenFrom.Default),r=$(t).data("layout-tab"),void 0===r&&(r=c.TabNames.style),T.appendToTab(t,r,n,a)}),g&&g.widget().each(function(e,t){var i,a,o=+$(t).data("layout-tab-priority");TradingView.isNaN(o)&&(o=c.TabPriority.Display),i=~~$(t).data("layout-tab-open"),a=$(t).data("layout-tab"),void 0===a&&(a=c.TabNames.properties),T.appendToTab(t,a,o,i)}),_&&_.widget().each(function(e,t){T.appendToTab(t,c.TabNames.visibility,c.TabPriority.Display,!1)}),x=this._source instanceof r&&!!this._source.metaInfo().pine,x&&this._source.metaInfo(),this.insertTabs(),this._helpItemRequired()&&this._createHelp(),j=110,$(".js-dialog").each(function(){var e=parseInt($(this).css("z-index"),10);e>j&&(j=e)}),P.css("z-index",j),k=$('<div class="main-properties main-properties-aftertabs"></div>').appendTo(w),I=$('<div class="dialog-buttons">').appendTo(k),N=function(){
function e(t){t._childs&&t._childs.length&&$.each(t._childs,function(i,a){"percentage"===a?t.percentage.listeners().fire(t.percentage):e(t[a])})}var t=[];y&&"function"==typeof y.defaultProperties&&(t=t.concat(y.defaultProperties())),f&&"function"==typeof f.defaultProperties&&(t=t.concat(f.defaultProperties())),0===t.length&&T._source.properties?t=[T._source.properties()]:T._source._sessionsStudy&&(t=t.concat(T._source._sessionsStudy.properties())),t.length&&($.each(t,function(t,i){"chartproperties"===i._defaultName||(T._source instanceof o?T._model.restoreLineToolFactoryDefaults(T._source,"Load default drawing template"):T._source instanceof r?T._model.restoreDefaults(i):T._model.restoreFactoryDefaults(i)),T._source.calcIsActualSymbol&&T._source.calcIsActualSymbol(),e(i)}),T._source.properties().minTick&&T._source.properties().minTick.listeners().fire(T._source.properties().minTick),T._source.properties().precision&&T._source.properties().precision.listeners().fire(T._source.properties().precision),f&&f.loadData(),b&&b.loadData(),y.onResoreDefaults&&y.onResoreDefaults(),y&&y.loadData(),_&&_.loadData())},V=function(){_&&_.loadData(),f&&f.loadData()},(!h||window.is_authenticated)&&y&&"function"==typeof y.createTemplateButton&&t.enabled("linetoolpropertieswidget_template_button")?(C&&I[0].appendChild(C.domNode),y.createTemplateButton({popupZIndex:j,defaultsCallback:N,loadTemplateCallback:V}).addClass("tv-left").appendTo(I)):TradingView.isInherited(this._source.constructor,r)?(L=[{title:$.t("Reset Settings"),action:N},{title:$.t("Save As Default"),action:function(){T._source.properties().saveDefaults()}}],B=$('<a href="#" class="_tv-button tv-left">'+$.t("Defaults")+'<span class="icon-dropdown"></span></a>'),B.on("click",function(e){e.preventDefault();var t=$(this);t.is(".active")||t.trigger("button-popup",[L,!0])}).appendTo(I),p(B,null,{direction:"down",event:"button-popup",notCloseOnButtons:!0,zIndex:j})):$('<a class="_tv-button tv-left">'+$.t("Defaults")+"</a>").appendTo(I).click(N),$('<a class="_tv-button ok">'+$.t("OK")+"</a>").appendTo(I).click(function(){T.hide()}),$('<a class="_tv-button cancel">'+$.t("Cancel")+"</a>").appendTo(I).on("click",a),P.find("._tv-dialog-title a").on("click",a),$(window).bind("keyup.hidePropertyDialog",function(e){13===e.keyCode&&"textarea"!==e.target.tagName.toLowerCase()&&T.hide()}),$("select",w).each(function(){var e=$(this),t="tv-select-container dialog";e.hasClass("tv-select-container-fontsize")&&(t+=" tv-select-container-fontsize"),e.selectbox({speed:100,classHolder:t})}),$('input[type="text"]',w).addClass("tv-text-input inset dialog"),$("input.ticker",w).TVTicker(),P.css("min-width",O+"px"),TVDialogs.applyHandlers(P,e),z={top:($(window).height()-P.height())/2,left:($(window).width()-P.width())/2},y&&"function"==typeof y.dialogPosition&&(z=y.dialogPosition(z,P)||z),TVDialogs.positionDialog(P,z),window.lineToolPropertiesToolbar&&window.lineToolPropertiesToolbar.hide(),l.emit("edit_object_dialog",{
objectType:this._source===this._model.mainSeries()?"mainSeries":this._source instanceof o?"drawing":this._source instanceof r?"study":"other",scriptTitle:this._source.title()}),P},a.prototype._helpItemRequired=function(){return this._source._metaInfo&&!!this._source._metaInfo.helpURL},a.prototype._createHelp=function(){var e=$('<a class="help" href="#" target="_blank" title="'+$.t("Help")+'"></a>');e.attr("href",this._source._metaInfo.helpURL),this._tabContainer.prepend(e)},e.exports=a}).call(t,i(5))}});