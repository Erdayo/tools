$.fn.extend({
    dragging: function (data) {
        var $this = $(this),
            xPage,
            yPage,
            X,
            Y,
            xRand = 0,
            yRand = 0,
            father = $this.parent(),
            defaults = {
                move: 'both',
                randomPosition: true,
                hander: 1,
                callback: function () {

                }
            },
            opt = $.extend({}, defaults, data),
            movePosition = opt.move,
            random = opt.randomPosition,
            hander = opt.hander,
            lastFocus = $this;
        if (hander == 1) {
            hander = $this;
        } else {
            hander = $this.find(opt.hander);
        }
        father.css({"position": "relative", "overflow": "hidden"});
        $this.css({"position": "absolute"});
        hander.css({"cursor": "move"});
        var faWidth = father.width(),
            faHeight = father.height(),
            thisWidth = $this.width() + parseInt($this.css('padding-left')) + parseInt($this.css('padding-right')),
            thisHeight = $this.height() + parseInt($this.css('padding-top')) + parseInt($this.css('padding-bottom')),
            mDown = false,
            positionX,
            positionY,
            moveX,
            moveY;
        if (random) {
            $thisRandom();
        }

        function $thisRandom() {
            $this.each(function (index) {
                var randY = parseInt(Math.random() * (faHeight - thisHeight)),
                    randX = parseInt(Math.random() * (faWidth - thisWidth));
                if (movePosition.toLowerCase() == 'x') {
                    $(this).css({left: randX});
                } else if (movePosition.toLowerCase() == 'y') {
                    $(this).css({top: randY});
                } else if (movePosition.toLowerCase() == 'both') {
                    $(this).css({top: randY, left: randX});
                }
            });
        }

        hander.mousedown(function (e) {
            father.children().css({"zIndex": "0"});
            $this.css({"zIndex": "1"});
            mDown = true;
            X = e.pageX;
            Y = e.pageY;
            positionX = $this.position().left;
            positionY = $this.position().top;

            lastFocus = $this;
            $this.addClass('on').siblings().removeClass('on');
            $('fieldset[data-id=' + $this.attr('data-id') + ']').addClass('on').siblings().removeClass('on');
            return false;
        });

        document.addEventListener('keydown', function (e) {
            if (lastFocus) {
                e.preventDefault();
                var x = lastFocus[0].offsetLeft,
                    y = lastFocus[0].offsetTop;
                if (e.keyCode === 40) {  // down
                    y++;
                    thisYMove(lastFocus, y);
                } else if (e.keyCode === 38) { // up
                    y--;
                    thisYMove(lastFocus, y);
                } else if (e.keyCode === 39) { // right
                    x++;
                    thisXMove(lastFocus, x);
                } else if (e.keyCode === 37) { // left
                    x--;
                    thisXMove(lastFocus, x);
                }
            }
        });

        $(document).mouseup(function (e) {
            mDown = false;
            if ($(e.target).parents('div').hasClass('ui-widget-content')) {
                lastFocus = $(e.target).parents('.ui-widget-content');
                lastFocus.addClass('on').siblings().removeClass('on');
                $('fieldset[data-id=' + lastFocus.attr('data-id') + ']').addClass('on').siblings().removeClass('on');
            } else {
                lastFocus = null;
                if (!$(e.target).parents('[data-id]').length) {
                    $('.ui-widget-content, fieldset').removeClass('on');
                }
            }
            opt.callback();
        });
        $(document).mousemove(function (e) {
            if (!mDown) return;
            xPage = e.pageX;
            moveX = positionX + xPage - X;
            yPage = e.pageY;
            moveY = positionY + yPage - Y;

            if (movePosition.toLowerCase() == "x") {
                thisXMove();
            } else if (movePosition.toLowerCase() == "y") {
                thisYMove();
            } else if (movePosition.toLowerCase() == 'both') {
                thisAllMove();
            }
        });

        function thisXMove(obj, tmp) {
            tmp = tmp || moveX;
            if (tmp < 0) {
                tmp = 0;
            }
            if (tmp > (faWidth - thisWidth)) {
                tmp = faWidth - thisWidth;
            }
            if (obj) {
                obj.css({left: tmp});
                return;
            }
            $this.css({"left": tmp});
        }

        function thisYMove(obj, tmp) {
            tmp = tmp || moveY;
            if (moveY < 0) {
                tmp = 0;
            }
            if (moveY > (faHeight - thisHeight)) {
                tmp = faHeight - thisHeight;
            }
            if (obj) {
                obj.css({top: tmp});
                return;
            }
            $this.css({"top": tmp});
        }

        function thisAllMove(obj) {
            if (mDown == true) {
                $this.css({"left": moveX, "top": moveY});
            } else {
                return;
            }
            if (moveX < 0) {
                $this.css({"left": "0"});
            }
            if (moveX > (faWidth - thisWidth)) {
                $this.css({"left": faWidth - thisWidth});
            }
            if (moveY < 0) {
                $this.css({"top": "0"});
            }
            if (moveY > (faHeight - thisHeight)) {
                $this.css({"top": faHeight - thisHeight});
            }
        }
    }
});