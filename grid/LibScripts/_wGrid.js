define(
    'wGrid',
    [],
    function() {

        $.widget( "custom.grid", {

            // Здесь задается список настроек и их значений по умолчанию
            options: {
                width: 200,
                height: 300,
                pagesize: 10,
                pagesizeoptions: ['5', '10', '20'],
                editable: false,
                pageable: false,
                sortable: true,
                selectedrow: {},
                checkedColumn: false,
                hint: '',
                layout:0,
                lineHeight:0,
                sortdir: 'asc',
                columns: [], // {text: 'Текст', type: 'text', editable: false, datafield: 'ID', width: '30%'}
                source: {
                    datafields: [],
                    localdata: [],
                    id:'id'
                },
                ds: null
            },

            // Функция, вызываемая при активации виджета на элементе
            _create: function() {
                this.selectedrow = {}; // выбранная строчка
                this.sort = {el:null, datafield:null, dir:null}; // текущая сортировка
                this.layouts = ['is-striped-bg', 'is-horizontal-div', 'is-vertical-div'];
                this.lineHeights = ['is-normal', 'is-enlarged'];
                this.element.css({width: this.options.width, height: this.options.height});
                var grid = $('<div class="grid-b is-footer">'+
                    '<div class="header-bl">'+
                    '<table class="table-bl" cellspacing="0" cellpadding="0"><thead><tr tabindex="1"><th class="grid-th-bh"><div class="th-text-be text-ellipsis-gm">&nbsp;</div></th></tr></thead></table>'+
                    '</div>'+
                    '<div class="scrollable-bl">'+
                    '<div class="scrollable-bll" style="overflow: hidden"><div>'+
                    '<table class="table-bl" cellspacing="0" cellpadding="0"><tbody></tbody></table>' +
                    '</div></div>'+
                    '</div>'+
                    '<div class="grid-paginator-b"><div class="text-with-icon-b"><div class="text-be">10</div></div></div>'+
                    '</div>');
                grid.attr('title', this.options.hint);
                this._headTable = grid.find('.header-bl .table-bl thead');
                this._bodyTable = grid.find('.scrollable-bl .table-bl tbody');
                this._grid = grid;
                this.element.append(grid);
            },

            reloading: function(columns, source) {

                if (columns != null)
                    this.options.columns = columns;
                if (source != null)
                    this.options.source = source;
                if (columns) {
                    this.renderHeader();
                    var headers = this._headTable.children('tr').children('th');
                    this._addeventsheaders(headers);
                }
                
                this.renderData();
            },
            
            renderHeader: function(){
                this._headTable.empty();
                
                if (this.options.columns.length > 0) {
                	var tr = $('<tr></tr>');

	                // чекбокс
	                var th = $('<th width="40" class="grid-th-bh is-checkedcolumn" style="width:40px"><div class="checkbox-b is-bordered th-checkbox-bh"><input type="checkbox"><div class="check-sign-e"></div></div></th>');
	                th.data('GridHeaders', {data:{}, type:'checkbox'});
	                if (!this.options.checkedColumn)
	                    th.hide();
	                tr.append(th);
	
	                // остальные столбцы
	                for (var i = 0; i < this.options.columns.length; i++) {
	                    th = $('<th class="grid-th-bh is-clickable-eff"></th>');
	                    th.data('GridHeaders', {data:this.options.columns[i], type:'item'});
	                    var text = $('<div class="th-text-be text-ellipsis-gm"></div>').html(this.options.columns[i].text);
	                    th.append(text);
	                    tr.append(th);
	                }
                } else {
                	var tr = $('<tr tabindex="1"><th class="grid-th-bh"><div class="th-text-be text-ellipsis-gm">&nbsp;</div></th></tr>');
                }
                
                this._headTable.append(tr);
            },
            
            renderData: function () {
                this._bodyTable.empty();
                if (this.options.columns.length==0) return;
                for (var j = 0, count = this.options.source.localdata.length; j < count; j++) {
                    var row = this.options.source.localdata[j];
                    this.addrow(row);
                }
            },
            
            clear: function(){
                this._bodyTable.empty();
                this._headTable.empty();
            },

            selectrow: function(id){
                var rows = this._bodyTable.find('tr');
                for (var i = 0; i < rows.length; i++) {
                    var data = $(rows[i]).data('GridRows');
                    if (data && id == data[this.options.source.id]) {
                        this._selectrow($(rows[i]));
                        break;
                    }
                }
            },
            
            addrow: function (row, aftersel) {
                var that = this;
                var tr = $('<tr class="grid-tr-bh"></tr>');
                tr.click(function(){
                    that._selectrow($(this));
                });
                // чекбокс
                var td = $('<td class="grid-body-td-bh is-checkbox is-checkedcolumn" style="width:40px"><div class="checkbox-b is-bordered"><input type="checkbox"><div class="check-sign-e"></div></div></td>');
                if (!this.options.checkedColumn)
                    td.hide();
                tr.append(td);

                for (var i = 0; i < this.options.columns.length; i++) {
                    td = $('<td class="grid-body-td-bh"><div class="content-bhl"></div></td>');
                    var datafield = this.options.columns[i].datafield;
                    tr.data('GridRows', row);
                    if(row[datafield] !== undefined)
                        td.children('.content-bhl').html(row[datafield]);
                    tr.append(td);
                }
                
                if (aftersel && ('el' in this.selectedrow)) {
                    var rows = this._bodyTable.find('tr');
                	for(var i=0;i<rows.length;i++){
	                	var data = $(rows[i]).data('GridRows');
	                	if (this.selectedrow.data[this.options.source.id] == data[this.options.source.id]){
	                		this.options.source.localdata.splice(i+1, 0, row);
	                		break;
	                	}
                	}
                	this.selectedrow.el.after(tr);
                } else 
                    this._bodyTable.append(tr);
                	
                return tr;
            },

            delrow: function(id){
                var rows = this._bodyTable.find('tr');
            	for(var i=0;i<rows.length;i++){
                	var data = $(rows[i]).data('GridRows');
                	if (id == data[this.options.source.id]){
                		$(rows[i]).remove();
                		this.options.source.localdata.splice(i, 1);
                		break;
                	}
            	}
            },

            refreshrow: function(row){
               var rows = this._bodyTable.find('tr');
               for(var i=0;i<rows.length;i++){
                	var tr = $(rows[i]);
                	var data = tr.data('GridRows');
                	if (row[this.options.source.id] == data[this.options.source.id]){
                		var tds = tr.find("td");
                		for (var j = 0; j < this.options.columns.length; j++) {
                			var td = tds.eq(j+1);
                			var datafield = this.options.columns[j].datafield;
		                    if(row[datafield])
		                        td.children('.content-bhl').html(row[datafield]);
		                }
		                this.options.source.localdata[i] = row;
		                tr.data('GridRows', row);
                		break;
                	}
            	}
            },

            getcolumn: function (datafield) {
                var column = null;
                if (this.options.columns) {
                    $.each(this.options.columns, function () {
                        if (this.datafield == datafield) {
                            column = this;
                            return false;
                        }
                    });
                }
                return column;
            },

            getcolumnEl: function (datafield) {
                var column = null;
                var th = this._headTable.children('th');
                $.each(th, function () {
                    var data = $(this).data('GridHeaders');
                    if (data.type=='item' && data.data.datafield == datafield) {
                        column = this;
                        return false;
                    }
                });
                return column;
            },
            
            getselectedrow: function(){
            	if ('el' in this.selectedrow) {
            		return this.selectedrow;
            	}
            	return null;
            },
            
           getheadrow: function(){
            	return this._headTable.children('tr');
            },
            
            

            _addeventsheaders: function(headers){
                var that = this;
                headers.click(function(event){
                    var data = $(this).data('GridHeaders');
                    if (data.type=='item') // если не чекбокс
                        that._sort($(this));
                });
            },

            _sort: function(obj){
                var data = obj.data('GridHeaders').data;
                if (data.datafield == this.sort.datafield) // если тот же датафилд
                    this._sortBy(obj, data.datafield, this.sort.dir=='asc'?'desc':'asc');
                else
                    this._sortBy(obj, data.datafield, this.options.sortdir)
            },

            _sortBy: function(obj, datafield, dir){
                // убираем сортировку
                if (this.sort.el)
                    this.sort.el.removeClass('is-checked is-arrow-down is-arrow-up');

                // выставляем сортировку
                if (dir == 'asc')
                    obj.addClass('is-checked is-arrow-up');
                else
                    obj.addClass('is-checked is-arrow-down');

                // сохраняем данные
                this.sort = {el:obj, datafield:datafield, dir:dir};

                // сообщаем сервису об необходимости сортировки
                //this._trigger("sort", null, [datafield, dir]);
            },

            _selectrow: function(obj){
                if (!this.options.ds || (this.options.ds && this.options.ds.canMoveCursor())) {
	                // убираем подсветку и добавляем новую
	                if ('el' in this.selectedrow) {
	                    this.selectedrow.el.removeClass('is-check');
	                    this.selectedrow.el.attr('tabindex', null);
	                    this._headTable.children('tr').attr('tabindex', null);
	                }
	                obj.attr('tabindex', 1);
	                obj.addClass('is-check');
	
	                // выбираем другую строчку
	                var data = obj.data('GridRows');
	                this.selectedrow = {data:data, el:obj};
	                this._trigger("selectrow", null, [data, obj]); 
                }
            },

            _setcolumnproperty: function (datafield, propertyname, value) {
                if (datafield == null || propertyname == null || value == null)
                    return null;

                var column = this.getcolumn(datafield);
                if (column == null)
                    return false;

                column[propertyname] = value;

                switch (propertyname) {
                    case "text":
                        var columnEl = this.getcolumnEl(datafield);
                        $(columnEl).children('.th-text-be').html(value);
                        break;
                }
                return true;
            },

            setcolumnproperty: function (datafield, propertyname, value){
                this._setcolumnproperty(datafield, propertyname, value);
            },

            setPageable: function(value) {
                var paginator = this._grid.children('.grid-paginator-b');
                this.options.pageable = value;
                if (value)
                {
                    this._grid.addClass('is-footer');
                    paginator.show();
                }
                else
                {
                    this._grid.removeClass('is-footer');
                    paginator.hide();
                }
            },

            setCheckedColumn: function(ok){
                this.options.checkedColumn = ok;
                if (ok)
                	this.element.find('.is-checkedcolumn').show();
                else
                	this.element.find('.is-checkedcolumn').hide();
            },

            setLayout: function(layout){
                this.options.layout = layout;
                this._grid.removeClass(this.layouts.join(' ')).addClass(this.layouts[layout]);
            },

            setLineHeight: function(value){
                this.options.lineHeight = value;
                this._grid.removeClass(this.lineHeights.join(' ')).addClass(this.lineHeights[value]);
            },

            setDataset: function(value){
                this.options.ds = value;
            },

            setHint: function(value){
                this._grid.attr('title', value);
            },

            // Этот метод вызывается для изменения настроек плагина
            _setOption: function( key, value ) {
                switch( key ) {
                    // предпринимаем действия по изменению свойства
                    //break;
                    case "pageable":
                        this.setPageable(value);
                        break;
                    case "checkedColumn":
                        this.setCheckedColumn(value);
                        break;
                    case "layout":
                        this.setLayout(value);
                        break;
                    case "lineHeight":
                        this.setLineHeight(value);
                        break;
                    case "dataset":
                        this.setDataset(value);
                        break;
                    case "hint":
                        this.setHint(value);
                        break;
                }

                // UI 1.9 для этого достаточно вызвать метод _super
                this._super( "_setOption", key, value );
            },

            // деструктор - метод, который будет вызван при удалении плагина с элемента.
            destroy: function() {

            }
        });
    });