function Tools() {
    this.props = {
        file: 'res/images/4-1501201A01V28.jpg',
        fileName: '4-1501201A01V28',
        fileType: 'jpg',
        words: $('#words').val(),
    };
    this.editProps = {
        'edit1': {
            fontSize: 12,
            fontColor: '#fff',
            blur: 0,
            words: this.props.words,
            fontFamily: '微软雅黑',
            pos: {
                x: 0,
                y: 0,
                width: 100,
                height: 100
            }
        }
    };
    this.editCount = 1;
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.cW = 0;
    this.cH = 0;
    this.dragFlag = false;
    this.init();
}

Tools.prototype = {
    init: function () {
        this.initCP();
        this.changeProps();
        this.drawImg();
        this.handlerDrag();
        this.buttonOption();
    },

    initCP: function () {
        var self = this;
        $("img").colorpicker({
            fillcolor: true,
            success: function (o, color) {
                var id = $(o).parents('fieldset').attr('data-id');
                $(o).siblings('input').val(color).css('color', color);
                self.editProps[id].fontColor = color;
                $('div[data-id=' + id + '] label').css({
                    color: color
                });
                self.doCache();
            }
        });
    },

    buttonOption: function () {
        var self = this;
        $('.add').click(function () {
            self.add();
            $('.options').animate({scrollTop: $('.options').scrollTop() + 260}, 300);
        });

        $('.save').click(function () {
            self.preview();
            self.saveImg();
        });

        $('.preview').click(function () {
            self.preview();
            $('.show > div').hide();
        });

        $('.reset').click(function () {
            self.drawImg();
            self.editProps = {};
            self.editCount = 0;
            $('fieldset[data-id]').parent().remove();
            $('div[data-id]').remove();
            self.add();
        });

        $('body').click(function (e) {
            if (!$(e.target).hasClass('preview')) {
                $('.show > div').show();
            }
        });
    },

    add: function () {
        $('.option').before('<li><fieldset data-id="edit' + (++this.editCount) + '">\n' +
            '            <legend>edit' + this.editCount + '</legend>\n' +
            '<div>\n' +
            '                <label>局部替换文字:</label>\n' +
            '                <input type="text" value="' + this.props.words + '" name="words">\n' +
            '            </div>' +
            '            <div>\n' +
            '                <label>字体大小:</label>\n' +
            '                <input type="number" value="12" name="fontSize">\n' +
            '            </div>\n' +
            '<div>\n' +
            '                <label>字体颜色:</label>\n' +
            '                <input type="text" value="#000" name="fontColor">\n' +
            '                <img src="res/images/colorpicker.png">\n' +
            '            </div>' +
            '<div>\n' +
            '                <label>字体:</label>\n' +
            '                 <select name="fontFamily">\n' +
            '                    <option value="微软雅黑">微软雅黑</option>\n' +
            '                    <option value="宋体">宋体</option>\n' +
            '                    <option value="方正粗谭黑简体">方正粗谭黑简体</option>\n' +
            '                    <option value="方正正大黑简体">方正正大黑简体</option>\n' +
            '                </select>' +
            '            </div>' +
            // '            <div>\n' +
            // '                <label>模糊度:</label>\n' +
            // '                <input type="number" value="0" name="blur">\n' +
            // '            </div>\n' +
            '        </fieldset></li>'
        );
        $('.show').append('<div class="ui-widget-content" data-id="edit' + this.editCount + '"><label class="control"><font>' + this.props.words + '</font></label></div>');
        this.editProps['edit' + this.editCount] = {
            fontSize: 12,
            fontColor: '#000',
            blur: 0,
            words: this.props.words,
            fontFamily: '微软雅黑',
            pos: {
                x: 0,
                y: 0,
                width: 100,
                height: 100
            }
        };
        this.initCP();
        this.handlerDrag();
        this.doCache();
    },

    changeProps: function () {
        var self = this;
        $('input').live('change', function () {
            var type = $(this).attr('type');
            switch (type) {
                case 'file':
                    var tmp = $(this)[0];
                    if (tmp.files[0] !== undefined) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            self.props.file = e.target.result;
                            self.drawImg();
                        };
                        reader.readAsDataURL(tmp.files[0]);
                        self.props.fileName = tmp.files[0].name.split('.')[0];
                        self.props.fileType = tmp.files[0].name.split('.')[1];
                    }
                    break;
                default:
                    if ($(this).parents('fieldset').length) {
                        var id = $(this).parents('fieldset').attr('data-id');
                        self.editProps[id][$(this).attr('name')] = $(this).val();
                        $('div[data-id=' + id + '] label').css({
                            'font-size': self.editProps[id].fontSize + 'px',
                            'font-family': self.editProps[id].fontFamily
                        }).text(self.editProps[id].words);
                    } else {
                        self.props[$(this).attr('name')] = $(this).val();
                    }
                    break;
            }
            self.doCache();
        }).live('focus', function () {
            if ($(this).parents('fieldset').length) {
                var id = $(this).parents('fieldset').attr('data-id');
                $('[data-id]').removeClass('on');
                $('[data-id=' + id + ']').addClass('on');
            }
        });

        $('select').live('change', function () {
            var id = $(this).parents('fieldset').attr('data-id');
            self.editProps[id][$(this).attr('name')] = $(this).val();
            $('div[data-id=' + id + '] label').css({
                'font-size': self.editProps[id].fontSize + 'px',
                'font-family': self.editProps[id].fontFamily
            }).text(self.editProps[id].words);
        });
    },

    drawImg: function () {
        var img = new Image(),
            self = this;
        img.src = this.props.file;
        img.onload = function () {
            self.cW = img.naturalWidth;
            self.cH = img.naturalHeight;
            self.canvas.width = self.cW;
            self.canvas.height = self.cH;
            self.ctx.clearRect(0, 0, self.cW, self.cH);
            self.ctx.drawImage(img, 0, 0, self.cW, self.cH);
            self.img = img;
        };
    },

    handlerDrag: function () {
        var self = this;
        $('.show > div').each(function () {
            $(this).unbind('dragging resizable');
            $(this).dragging({
                move: 'both',
                randomPosition: false,
                hander: '.control',
                callback: function () {
                    var id = $(this).attr('data-id');
                    if (self.editProps.hasOwnProperty(id)) {
                        self.editProps[id].pos = {
                            x: parseInt($(this).css('left')),
                            y: parseInt($(this).css('top')),
                            width: parseInt($(this).css('width')),
                            height: parseInt($(this).css('height'))
                        };
                    }
                }.bind(this)
            });
            $(this).resizable({
                aspectRatio: false
            })
        });
    },


    handlerColor: function (pos) {
        var imgD = this.ctx.getImageData(pos.x, pos.y, pos.width, pos.height),
            colors = [],
            tmpCount = 0,
            grd = this.ctx.createLinearGradient(0, 0, pos.width, pos.height),
            tmpSub = 0;
        for (var i = 0; i < imgD.width; i += 4) {
            for (var j = 0; j < imgD.height; j += 4) {
                var r = imgD.data[(imgD.width * j + i) * 4],
                    g = imgD.data[(imgD.width * j + i) * 4 + 1],
                    b = imgD.data[(imgD.width * j + i) * 4 + 2],
                    a = imgD.data[(imgD.width * j + i) * 4 + 3];
                colors.push({
                    x: i + pos.x,
                    y: j + pos.y,
                    color: 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')'
                })
            }
        }

        grd.addColorStop(0, colors[0].color);
        grd.addColorStop(1, colors[Math.ceil(pos.height / 4)].color);

        // colors = colors.sort(function (a, b) {
        //     return a.y - b.y;
        // });
        //
        // for (var k = 1; k < colors.length; k++) {
        //     if (colors[k].y !== colors[tmpSub].y) {
        //         grd.addColorStop(tmpCount, colors[tmpSub].color);
        //         grd.addColorStop(tmpCount, colors[k].color);
        //         this.ctx.beginPath();
        //         this.ctx.fillStyle = grd;
        //         this.ctx.rect(colors[tmpSub].x, colors[tmpSub].y, pos.width, 4);
        //         this.ctx.fill();
        //         this.ctx.closePath();
        //         tmpCount = 0;
        //         tmpSub = k;
        //         grd = this.ctx.createLinearGradient(0, 0, pos.width, pos.height);
        //     }
        //
        // }
        return grd;
    },

    drawBg: function (pos, editProp) {
        this.ctx.beginPath();
        this.ctx.fillStyle = this.handlerColor(pos);
        this.ctx.rect(pos.x, pos.y, pos.width, pos.height);
        this.ctx.fill();
        this.ctx.closePath();

        this.ctx.beginPath();
        this.ctx.fillStyle = editProp.fontColor;
        this.ctx.textBaseline = 'middle';
        this.ctx.textAlign = 'center';
        this.ctx.font = editProp.fontSize + 'px ' + editProp.fontFamily;
        this.ctx.fillText(editProp.words, pos.x + pos.width / 2, pos.y + pos.height / 2);
        this.ctx.closePath();
    },

    preview: function () {
        var self = this;
        this.ctx.clearRect(0, 0, this.cW, this.cH);
        this.ctx.drawImage(this.img, 0, 0, this.cW, this.cH);
        for (var i in this.editProps) {
            self.drawBg(self.editProps[i].pos, self.editProps[i]);
        }
    },

    saveImg: function () {
        var newFileName = this.props.fileName + '.' + this.props.fileType,
            img = document.getElementById('canvas').toDataURL('image/' + this.props.fileType).replace("image/" + this.props.fileType, "image/octet-stream;");
        var savaFile = function (data, filename) {
            var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
            save_link.href = data;
            save_link.download = filename;
            var event = document.createEvent('MouseEvents');
            event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            save_link.dispatchEvent(event);
        };
        savaFile(img, newFileName);
    },

    /**
     * @method setCookie   写入cookie
     * @param  {string}    name
     * @param  {string}    value
     */
    setCookie: function (name, value) {
        var domain = (window.location.host).split('.');
        domain.shift();
        domain = domain.join('.');
        document.cookie = name + "=" + escape(value) + ";expires=Fri, 31 Dec 9999 23:59:59 GMT;path=/;domain=" + domain;
    },

    /**
     * @method setCookie   读取cookie
     * @param  {string}    name
     */
    getCookie: function (name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    },

    doCache: function () {
        this.setCookie('baseProps', JSON.stringify(this.props));
        this.setCookie('editProps', JSON.stringify(this.editProps));
    },

    getCache: function () {

    }


};

new Tools();