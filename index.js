!function l(s,c,r){function a(t,e){if(!c[t]){if(!s[t]){var i="function"==typeof require&&require;if(!e&&i)return i(t,!0);if(d)return d(t,!0);var n=new Error("Cannot find module '"+t+"'");throw n.code="MODULE_NOT_FOUND",n}var o=c[t]={exports:{}};s[t][0].call(o.exports,function(e){return a(s[t][1][e]||e)},o,o.exports,l,s,c,r)}return c[t].exports}for(var d="function"==typeof require&&require,e=0;e<r.length;e++)a(r[e]);return a}({1:[function(e,t,i){!function(){"use strict";Object.defineProperty(i,"__esModule",{value:!0}),i.default={props:["block","index","columnsCount","pageUid","pageId"],mounted:function(){this.block.isNew?this.$nextTick(function(){this.pending=!1}):this.pending=!1,this.block.content._uid||(this.block.content._uid=this.block.content._key+"_"+(new Date).valueOf()+"_"+this._uid),this.activeFieldSet||(this.activeFieldSet=this.fieldSets[0].key);var e=JSON.parse(localStorage.getItem(this.localUiStateKey));e?(this.expanded=e.expanded,this.showPreview=e.showPreview,this.activeFieldSet=e.activeFieldSet):this.storeLocalUiState(),this.block.preview&&this.showPreview?this.displayPreview(this.block.preview):this.displayFieldSet(this.activeFieldSet),this.block.isNew&&this.$emit("input")},data:function(){return{pending:!0,activeFieldSet:null,expanded:!0,previewFrameContent:null,previewHeight:0,previewStored:!1,showPreview:!1}},computed:{localUiStateKey:function(){return"kBuilder.uiState."+this.block.content._uid},extendedUid:function(){return this.pageId.replace("/","-")+"-"+this._uid},previewUrl:function(){return this.previewStored?"kirby-builder-preview/"+this.extendedUid+"?"+this.objectToGetParams(this.block.preview)+"&pageid="+this.pageId:null},fieldSets:function(){var e=[];if(this.block.tabs){for(var t in this.block.tabs)if(this.block.tabs.hasOwnProperty(t)){var i=this.block.tabs[t];e.push(this.newFieldSet(i,t,this.block.content[t]))}}else this.block.fields&&e.push(this.newFieldSet(this.block,"content",this.block.content,"edit",this.$t("edit")));return e},status:function(){return 1==this.expanded?0<this.previewHeight?"preview":"edit":"closed"}},methods:{onBlockInput:function(e){this.$emit("input",this.val)},displayPreview:function(){var e=this;this.showPreview=!0,this.expanded=!0;var t={preview:this.block.preview,blockcontent:this.block.content,blockUid:this.extendedUid};this.$api.post("kirby-builder/preview",t).then(function(){e.previewStored=!0}),this.storeLocalUiState()},displayFieldSet:function(e){this.showPreview=!1,this.activeFieldSet=e,this.previewHeight=0,this.storeLocalUiState()},onPreviewLoaded:function(e){this.previewHeight=e.detail.height,this.activeFieldSet=null},toggleExpand:function(e){this.expanded="boolean"==typeof e?e:!this.expanded,this.storeLocalUiState()},newFieldSet:function(e,t,i,n,o){var l={fields:e.fields,key:t,model:i,icon:n||e.icon||null,label:o||e.label||null};return l},objectToGetParams:function(t){return Object.keys(t).map(function(e){return e+"="+t[e]}).join("&")},storeLocalUiState:function(){var e={expanded:this.expanded,showPreview:this.showPreview,activeFieldSet:this.activeFieldSet};localStorage.setItem(this.localUiStateKey,JSON.stringify(e))},tabIcon:function(e){return e?-1<e.indexOf("/")&&-1<e.indexOf(".")?null:e:null},tabImage:function(e){return e&&-1<e.indexOf("/")&&-1<e.indexOf(".")?e:null}}}}(),t.exports.__esModule&&(t.exports=t.exports.default);var n="function"==typeof t.exports?t.exports.options:t.exports;n.render=function(){var i=this,e=i.$createElement,n=i._self._c||e;return n("div",{class:["kBuilderBlock","kBuilderBlock--col-"+i.columnsCount,{"kBuilderBlock--pending":i.pending},"kBuilderBlock--"+i.status]},[n("div",{class:"kBuilderBlock__header kBuilderBlock__header--col-"+i.columnsCount},[n("k-icon",{class:"kBuilder__dragDropHandle kBuilder__dragDropHandle--col-"+i.columnsCount,attrs:{type:"sort"}}),i._v(" "),n("span",{staticClass:"kBuilderBlock__label",on:{click:i.toggleExpand}},[n("k-icon",{staticClass:"kBuilderBlock__expandedIcon",class:{"kBuilderBlock__expandedIcon--expanded":i.expanded},attrs:{type:"angle-down"}}),i._v("\n      "+i._s(i.block.label)+"\n    ")],1),i._v(" "),n("div",{staticClass:"kBuilderBlock__actions"},[n("k-button-group",{staticClass:"kBuilderBlock__actionsGroup"},[i._l(i.fieldSets,function(t){return 1<i.fieldSets.length||i.block.preview?n("k-button",{key:"showFierldSetButton-"+i._uid+t.key,staticClass:"kBuilderBlock__actionsButton",class:{"kBuilderBlock__actionsButton--active":i.activeFieldSet==t.key&&i.expanded},attrs:{icon:i.tabIcon(t.icon),image:i.tabImage(t.icon)},on:{click:function(e){i.displayFieldSet(t.key),i.toggleExpand(!0)}}},[i._v(i._s(t.label))]):i._e()}),i._v(" "),i.block.preview?n("k-button",{staticClass:"kBuilderBlock__actionsButton",class:{"kBuilderBlock__actionsButton--active":i.showPreview&&i.expanded},attrs:{icon:"preview"},on:{click:function(e){i.displayPreview()}}}):i._e()],2),i._v(" "),n("div",{staticClass:"kBuilderBlock__control"},[n("k-dropdown",{staticClass:"kBuilderBlock__actionsDropDown"},[n("k-button",{staticClass:"kBuilderBlock__actionsButton",attrs:{icon:"dots"},on:{click:function(e){i.$refs["blockActions"+i.block.uniqueKey].toggle()}}}),i._v(" "),n("k-dropdown-content",{ref:"blockActions"+i.block.uniqueKey},[n("k-dropdown-item",{attrs:{icon:"copy"},on:{click:function(e){i.$emit("cloneBlock",i.index)}}},[i._v(i._s(i.$t("builder.clone")))]),i._v(" "),n("k-dropdown-item",{attrs:{icon:"trash"},on:{click:function(e){i.$emit("deleteBlock",i.index)}}},[i._v(i._s(i.$t("delete")))])],1)],1)],1)],1)],1),i._v(" "),n("div",{directives:[{name:"show",rawName:"v-show",value:i.expanded,expression:"expanded"}],staticClass:"kBuilderBlock__content"},[i.block.preview&&i.showPreview&&i.previewUrl?n("iframe",{staticClass:"kBuilder__previewFrame",style:{height:i.previewHeight+"px"},attrs:{src:i.previewUrl},on:{loaded:i.onPreviewLoaded}}):i._e(),i._v(" "),i._l(i.fieldSets,function(t){return i.activeFieldSet===t.key?n("k-fieldset",i._g({key:t.key+i._uid,staticClass:"kBuilderBlock__form",attrs:{value:{},fields:t.fields,validate:!0},model:{value:t.model,callback:function(e){i.$set(t,"model",e)},expression:"fieldSet.model"}},i.$listeners)):i._e()})],2)])},n.staticRenderFns=[]},{}],2:[function(n,e,l){!function(){"use strict";Object.defineProperty(l,"__esModule",{value:!0});var e,o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},t=n(1),i=(e=t)&&e.__esModule?e:{default:e};l.default={props:{value:String,fieldsets:Object,columns:Number,limit:Number,label:String,preview:Object,pageId:String,pageUid:String},components:{BuilderBlock:i.default},mounted:function(){var n=this;this.value&&(this.value.forEach(function(e,t){var i=n.fieldsets[e._key];n.blocks.push(n.newBlock(i,e._key,e,t))}),this.lastUniqueKey=this.value.length)},data:function(){return{blocks:[],toggle:!0,targetPosition:null,lastUniqueKey:0,dataField:{label:"date label",type:"date"},dateValue:null}},computed:{val:function(){return this.blocks.map(function(e){return e.content})},columnsCount:function(){return this.columns?this.columns:"1"},columnWidth:function(){return this.columns?"1/"+this.columns:"1/1"},draggableOptions:function(){return{group:"kirby-builder",put:"kirby-builder",clone:!0,forceFallback:!0,handle:".kBuilder__dragDropHandle",scroll:!0}},blockCount:function(){return this.blocks.length},fieldsetCount:function(){return Object.keys(this.fieldsets).length},fieldsetKeys:function(){return Object.keys(this.fieldsets)},addBlockButtonLabel:function(){return 1==this.fieldsetCount?this.$t("add")+" "+this.fieldsets[Object.keys(this.fieldsets)[0]].label:this.$t("add")},supportedBlockTypes:function(){return Object.keys(this.fieldsets)}},methods:{onBlockInput:function(e){this.$emit("input",this.val)},onBlockMoved:function(e){this.$emit("input",this.val)},onBlockAdded:function(e){this.$emit("input",this.val)},onBlockRemoved:function(e){this.$emit("input",this.val)},onMove:function(e){var t=e.relatedContext.index!=this.blocks.length+1,i=0==this.blocks.length,n=this.supportedBlockTypes.includes(e.relatedContext.element.blockKey);return(i||t)&&n},onClickAddBlock:function(e){this.targetPosition=e,1==this.fieldsetCount?this.addBlock(this.fieldsetKeys[0]):this.$refs.dialog.open()},addBlock:function(e){var t=null==this.targetPosition?this.blocks.length:this.targetPosition,i=this.fieldsets[e],n=this.newBlock(i,e,this.getBlankContent(e,i),this.lastUniqueKey++);n.isNew=!0,this.blocks.splice(t,0,JSON.parse(JSON.stringify(n))),this.$refs.dialog.close(),this.targetPosition=null,this.$emit("input",this.val)},getBlankContent:function(e,n){var o={_key:e};if(n.fields)Object.keys(n.fields).forEach(function(e){o[e]=n.fields[e].value||n.fields[e].default||""});else if(n.tabs){var t=function(t){if(o[t]={},n.tabs.hasOwnProperty(t)){var i=n.tabs[t];Object.keys(i.fields).forEach(function(e){o[t][e]=i.fields[e].value||i.fields[e].default||""})}};for(var i in n.tabs)t(i)}return o},cloneBlock:function(e){var t=JSON.parse(JSON.stringify(this.blocks[e]));t.isNew=!0,this.deepRemoveProperty(t.content,"_uid"),this.blocks.splice(e+1,0,t),this.blocks[e+1].uniqueKey=this.lastUniqueKey++,this.$emit("input",this.val)},deepRemoveProperty:function(t,i){var n=this;Object.keys(t).forEach(function(e){e===i?delete t[e]:"object"===o(t[e])&&n.deepRemoveProperty(t[e],i)})},deleteBlock:function(e){this.clearLocalUiStates(this.blocks[e]),this.blocks.splice(e,1),this.$emit("input",this.val)},clearLocalUiStates:function(e){for(var t in e)if(e.hasOwnProperty(t)){e[t];"_uid"===t?localStorage.removeItem("kBuilder.uiState."+e[t]):"object"===o(e[t])&&this.clearLocalUiStates(e[t])}},newBlock:function(e,t,i,n){return{fields:e.fields?e.fields:null,tabs:e.tabs?e.tabs:null,blockKey:t,content:i,label:e.label,uniqueKey:n,preview:e.preview,showPreview:!1}}}}}(),e.exports.__esModule&&(e.exports=e.exports.default);var t="function"==typeof e.exports?e.exports.options:e.exports;t.render=function(){var n=this,e=n.$createElement,o=n._self._c||e;return o("k-field",{staticClass:"kBuilder",class:"kBuilder--col-"+n.columnsCount,attrs:{label:n.label}},[o("k-draggable",{staticClass:"kBuilder__blocks k-grid",attrs:{move:n.onMove,options:n.draggableOptions},on:{end:function(e){n.drag=!1},update:n.onBlockMoved,add:n.onBlockAdded,remove:n.onBlockRemoved},model:{value:n.blocks,callback:function(e){n.blocks=e},expression:"blocks"}},[n._l(n.blocks,function(t,i){return o("k-column",{key:t.uniqueKey,staticClass:"kBuilder__column",attrs:{width:n.columnWidth}},[o("div",{staticClass:"kBuilder__inlineAddButton",class:{"kBuilder__inlineAddButton--horizontal":1==n.columnsCount,"kBuilder__inlineAddButton--vertical":1<n.columnsCount},on:{click:function(e){n.onClickAddBlock(i)}}}),n._v(" "),o("builder-block",{attrs:{block:t,index:i,columnsCount:n.columnsCount,pageUid:n.pageUid,pageId:n.pageId,showPreview:t.showPreview},on:{"update:showPreview":function(e){n.$set(t,"showPreview",e)},input:n.onBlockInput,cloneBlock:n.cloneBlock,deleteBlock:n.deleteBlock}}),n._v(" "),n.columnsCount%i==0&&1<n.columnsCount?o("div",{staticClass:"kBuilder__inlineAddButton kBuilder__inlineAddButton--vertical kBuilder__inlineAddButton--after",on:{click:function(e){n.onClickAddBlock(i+1)}}}):n._e()],1)}),n._v(" "),!n.limit||n.blockCount<n.limit?o("k-column",{attrs:{width:n.columnWidth}},[o("k-button",{staticClass:"kBuilder__addButton",attrs:{icon:"add"},on:{click:function(e){n.onClickAddBlock()}}},[n._v("\n        "+n._s(n.addBlockButtonLabel)+"\n      ")])],1):n._e()],2),n._v(" "),o("k-dialog",{ref:"dialog"},[o("k-list",n._l(n.fieldsets,function(e,t){return o("k-list-item",{key:t,staticClass:"kBuilder__addBlockButton",attrs:{text:e.label},on:{click:function(e){n.addBlock(t)}}})}))],1)],1)},t.staticRenderFns=[]},{1:1}],3:[function(e,t,i){"use strict";var n,o=e(2),l=(n=o)&&n.__esModule?n:{default:n};panel.plugin("timoetting/k-builder",{fields:{builder:l.default}})},{2:2}]},{},[3]);
