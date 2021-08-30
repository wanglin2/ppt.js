/*
 * ppt.js
 * v1.0
 * 简易幻灯片
 * 适用于IE9+、其他现代浏览器
 * http://mwlmt.cc/
 * 2017-04-02
 */
; (function () {

	//公共方法类
	function methods() { }
	methods.prototype = {
		//绑定事件
		on: function (ele, type, fn) {
			ele.addEventListener(type, fn, false);
		},
		//设置样式的方法
		setCss: function (ele, obj) {
			if (this.getType(obj) == 'Object') {
				for (var k in obj) {
					ele.style[k] = obj[k];
				}
			}
		},
		//获取元素的样式值
		getCss: function (ele, keys) {
			var styles = null;
			if (window.getComputedStyle) {
				styles = window.getComputedStyle(ele, null);
			} else {
				styles = ele.currentStyle;
			}
			if (keys) {
				return styles[keys];
			} else {
				return styles;
			}
		},
		//根据ID获取元素
		$id: function (ids) {
			if (ids[0] == '#') {
				ids = ids.substring(1);
			}
			return document.getElementById(ids);
		},
		//获取元素属性
		attr: function (ele, obj) {
			return ele.getAttribute(obj);
		},
		//获取或设置元素的html值
		html: function (ele, htmls) {
			if (!htmls) {
				return ele.innerHTML;
			}
			if (this.getType(htmls) == 'String') {
				ele.innerHTML = htmls;
			}
		},
		//检查元素类型
		getType: function (obj) {
			var s = Object.prototype.toString.call(obj);
			var l = s.length;
			return s.substring(8, l - 1);
		}
	};
	//简易的幻灯片类
	//每张幻灯片类---------------------------------------------------------------
	function ppts(ele, i, dur, ea, leaveResetItems, direction, pptItemEasing) {
		//继承公共方法类
		methods.call(this);

		this.con = ele;//当前ppt的节点
		this.index = i;//当前幻灯片的序号
		this.direction = direction || 'h';//水平还是垂直切换
		this.duration = dur;//动画时间
		this.easing = ea;//动画速度曲线
		//贝赛尔曲线值
		//'cubic-bezier(0.73,-0.3,0.61,2)'
		//this.easing='cubic-bezier(.33,-0.23,.58,1.75)'
		this.pptItemEasing = pptItemEasing || 0;
		this.curShowItemIndex = 0;//当前幻灯片里已显示到的条目，意思就是一开始带有约定类的某个元素都是隐藏的，通过按键来挨个显示出来，达到常规幻灯片的效果
		this.items = [];//该PPT页中的需要通过方向键来控制显示与隐藏的元素组成的数组
		this.itemsLen = 0;//items的长度
		this.lazyitems = [];//当切换到该页PPT时需要挨个自动显示的元素组成的数组
		this.lazyPptItemsLen = 0;
		this.lazyTimer = null;//执行上一行动作的定时器
		this.lazyShowTime = 500;//挨个显示的间隔时间
		this.events = [];//绑定到该页PPT上的事件监听函数
		this.onlyOneEndFlag = true;//只执行第一次的标志
		this.leaveResetItems = leaveResetItems || true;//离开该页PPT时是否要还原带pptItem的元素为隐藏状态

		this.setPptItemEasing();//先确定动画方式
		this.init();//初始化
		this.handleEvent();//绑定事件
	}
	//继承公共方法类
	ppts.prototype = new methods();
	//自己的方法
	ppts.prototype.constructor = ppts;
	//初始化
	ppts.prototype.init = function () {
		var _this = this;
		//该页PPT里需要通过方向键来控制显示的元素
		var _pptItemsArr = this.con.getElementsByClassName('pptItem');//获取该页PPT里所有的带pptItem类的元素
		this.itemsLen = _pptItemsArr.length;
		for (var i = 0; i < this.itemsLen; i++) {
			this.hidePptItem(_pptItemsArr[i]);
			this.items.push(_pptItemsArr[i]);
		}

		//该页PPT里需要自己挨个自动显示的元素
		//缓存所有带有lazyppt类的元素，这些元素是要再切换到该张幻灯片后依次显示的
		var _lazyPptItemsArr = this.con.getElementsByClassName('lazyPpt');//获取该页PPT里所有的带pptItem类的元素
		this.lazyPptItemsLen = _lazyPptItemsArr.length;
		for (var j = 0; j < this.lazyPptItemsLen; j++) {
			this.hideLazyShowItem(_lazyPptItemsArr[j]);
			this.lazyitems.push(_lazyPptItemsArr[j]);
		}
	}
	//让带有lazyppt类的元素挨个显示。
	ppts.prototype.lazyShow = function () {
		var _this = this;
		clearTimeout(_this.lazyTimer);
		_this.lazyTimer = setTimeout(function () {
			for (var i = 0; i < _this.lazyitems.length; i++) {
				_this.setCss(_this.lazyitems[i], {
					'opacity': 1,
					'transition': 'all ' + _this.duration + 's ' + _this.easing + ' ' + 0.3 * i + 's'
				});
				_this.setCss(_this.lazyitems[i], _this.pptItemStyle.showStyle);
			}
		}, _this.lazyShowTime);
	}
	//先隐藏带有lazyppt类的元素
	ppts.prototype.hideLazyShowItem = function (ele) {
		if (!ele) {
			for (var i = 0; i < this.lazyitems.length; i++) {
				this.setCss(this.lazyitems[i], { 'opacity': 0 });
				this.setCss(this.lazyitems[i], this.pptItemStyle.hideStyle);
			}
		} else {
			this.setCss(ele, { 'opacity': 0 });
			this.setCss(ele, this.pptItemStyle.hideStyle);
		}
	}
	//先隐藏带有pptItem类的元素
	ppts.prototype.hidePptItem = function (ele) {
		if (!ele) {
			for (var i = 0; i < this.items.length; i++) {
				this.setCss(this.items[i], { 'opacity': 0 });
				this.setCss(this.items[i], this.pptItemStyle.hideStyle);
			}
		} else {
			this.setCss(ele, { 'opacity': 0 });
			this.setCss(ele, this.pptItemStyle.hideStyle);
		}
	}
	//方向上键事件处理
	ppts.prototype.upEvent = function () {
		if (this.itemsLen <= 0) {
			return false;
		}
		if (this.curShowItemIndex > 0) {
			this.curShowItemIndex--;
		}
		this.hideItem(this.curShowItemIndex);
		if (this.curShowItemIndex > 0) {
			this.focusPptItem(this.curShowItemIndex - 1);
		}
		this.blurPptItem(this.curShowItemIndex, false);
	}
	//方向下键事件处理
	ppts.prototype.downEvent = function () {
		if (this.itemsLen <= 0 || this.curShowItemIndex >= this.itemsLen) {
			return false;
		}
		this.showItem(this.curShowItemIndex);
		this.focusPptItem(this.curShowItemIndex);
		this.blurPptItem(this.curShowItemIndex - 1, true);
		if (this.curShowItemIndex < this.itemsLen) {
			this.curShowItemIndex++;
		}
	}
	//确定带pptItem类的元素的动画类型1(渐现)、2(旋转)、3(缩小)、4(放大)，默认为0
	ppts.prototype.setPptItemEasing = function () {
		console.log(this.pptItemEasing)
		switch (this.pptItemEasing) {
			case 0://缩小
				this.pptItemStyle = {
					hideStyle: {
						'transform': 'scale(1.1)'
					},
					showStyle: {
						'transform': 'scale(1)', 'transform-origin': '0 0'
					}
				}
				break;
			case 1://放大
				this.pptItemStyle = {
					hideStyle: {
						'transform': 'scale(0.9)'
					},
					showStyle: {
						'transform': 'scale(1)', 'transform-origin': '0 0'
					}
				}
				break;
			case 2://从右向左平移
				this.pptItemStyle = {
					hideStyle: {
						'transform': 'translateX(50px)'
					},
					showStyle: {
						'transform': 'translateX(0px)'
					}
				}
				break;
			case 3://从下到上平移
				this.pptItemStyle = {
					hideStyle: {
						'transform': 'translateY(30px)'
					},
					showStyle: {
						'transform': 'translateY(0px)'
					}
				}
				break;
			case 4://从上到下平移
				this.pptItemStyle = {
					hideStyle: {
						'transform': 'translateY(-30px)'
					},
					showStyle: {
						'transform': 'translateY(0px)'
					}
				}
				break;
			case 5://旋转
				this.pptItemStyle = {
					hideStyle: {
						'transform': 'rotate(360deg)'
					},
					showStyle: {
						'transform': 'rotate(0)'
					}
				}
				break;
			default:
				break;
		}
	}
	//隐藏该元素下的带有pptItem类的元素
	ppts.prototype.hideItem = function (index) {
		this.setCss(this.items[index], {
			'opacity': 0,
			'transition': 'all ' + this.duration + 's ' + this.easing
		});
	}
	//显示该元素下的带有pptItem类的元素
	ppts.prototype.showItem = function (index) {
		this.setCss(this.items[index], {
			'opacity': 1,
			'transition': 'all ' + this.duration + 's ' + this.easing
		});
	}
	//让当前聚焦的pptItem条目带有高亮样式
	ppts.prototype.focusPptItem = function (index) {
		this.setCss(this.items[index], {
			'opacity': 1
		});
		this.setCss(this.items[index], this.pptItemStyle.showStyle);
	}
	//让当前聚焦的pptItem条目解除高亮样式
	ppts.prototype.blurPptItem = function (index, flag) {
		if (index < 0) {
			return;
		}
		if (flag) {
			this.setCss(this.items[index], {
				'opacity': 0.8
			});
		} else {
			this.setCss(this.items[index], {
				'opacity': 0
			});
			this.setCss(this.items[index], this.pptItemStyle.hideStyle);
		}

	}
	//监听过渡动画完成的事件
	ppts.prototype.handleEvent = function () {
		var _this = this;
		var _direction;
		if (this.direction == 'h') {
			_direction = 'left';
		} else {
			_direction = 'top';
		}
		this.on(this.con, 'transitionend', function (e) {
			//这里监听切换完成的事件的原理是检测动画过渡完成的事件，再检测当前PPT的位置，如果为0则代表显示的是当前的这页
			var _offset = _this.getCss(_this.con, _direction);
			if (parseInt(_offset) == 0) {//显示
				if (_this.onlyOneEndFlag) {//因为页面可能还有其他过渡动画，所以要确保只执行一次 
					_this.lazyShow();//依次显示懒显示的元素
					//执行当前页面显示完毕的监听事件
					for (var i = 0; i < _this.events.length; i++) {
						//执行该页PPT的独有事件
						if (_this.events[i].type == 'end') {
							_this.events[i].fn(_this.index + 1);
						}
					}
					_this.onlyOneEndFlag = false;
				}
			} else {//隐藏
				_this.onlyOneEndFlag = true;
				_this.hideLazyShowItem();
				if (_this.leaveResetItems) {
					_this.hidePptItem();
					_this.curShowItemIndex = 0;
				}
			};
		});
	}

	//幻灯片类-----------------------------
	function ppt(cfg) {
		//继承公共方法类
		methods.call(this);

		var cfg = cfg || {};//配置
		this.direction = cfg.direction || "h";//动画水平切还是垂直切
		this.progressBar = cfg.progressBar || true;//是否显示进度条
		this.transitionType = cfg.transitionType || 0;//切换特效
		this.pptItemEasing = cfg.pptItemEasing || 0;
		if (this.transitionType && parseInt(Number(this.transitionType)) >= 0 && parseInt(Number(this.transitionType)) < 5) {
			this.transitionType = parseInt(Number(this.transitionType));
		} else {
			this.transitionType = 0;
		}
		this.curPptIndex = 0;//当前播放到的PPT页数
		this.actualCurrentIndex = 0;//实际当前PPT页数
		this.duration = cfg.duration || 0.4;//执行切换PPT动画的时间
		this.easeing = cfg.easeing || 'ease';//动画方式
		this.bodyBroundColor = cfg.bodyBroundColor || '#fff';
		this.backgroundColor = cfg.backgroundColor || '#fff';//默认的PPT背景颜色，这是统一设置所有的，所以如果有个别不同的话需要用户自己显式设置覆盖
		//背景图片

		//和背景反差的颜色，用于页数等辅助信息，优先级为:用户设置>动态计算>黑色
		this.defaultColor = cfg.defaultColor || '';
		this.leaveResetItems = cfg.leaveResetItems || true;//离开时是否重置带pptItem类的元素为隐藏状态
		this.ppts = [];//单张PPT类组成的数组
		this.len = 0;//ppts数组的长度
		this.throttleFlag = true;//节流函数需要的标志
		this.showFirstTimer = null;//显示第一张PPT的定时器
		this.hashNum = null;//hash值
		this.dirShowElemnt = [];//显示按键方向的元素数组
		this.onlyOneBindFullScreenEvent = true;//确保只绑定一次全屏切换与否事件
		this.curFullScreenState = false;//当前是否全屏
		this.eventTypes = ['end', 'start'];//暂时只支持监听这两种事件

		this.init();//初始化
	}
	//继承公共方法类
	ppt.prototype = new methods();
	//自己的方法
	ppt.prototype.constructor = ppt;
	//初始化
	ppt.prototype.init = function () {
		this.render();//初始化定位和设置样式
		if (this.progressBar) {//是否创建进度条
			this.createProgressBar();
		}
		this.creatDirBox();//生成用于显示每次按下了哪个键的元素
		this.handleDir();//绑定方向键
	}
	//定位及添加幻灯片实例
	ppt.prototype.render = function () {
		var _this = this;
		this.initOtherStyle();
		var pptPages = document.querySelectorAll('.pptPage');//获取所有带pptPage类的元素
		this.len = pptPages.length;
		for (var i = 0; i < this.len; i++) {
			this.initStyle(pptPages[i]);
			this.hideRightOrBottom(pptPages[i]);
			this.ppts.push(new ppts(pptPages[i], i, this.duration, this.easeing, this.leaveResetItems, this.direction, this.pptItemEasing));
		}
		//初始化完先检查是否存在hash值，有的话优先显示hash值对应的页面
		this.hashNum = this.getHash();
		if (this.hashNum && typeof Number(this.hashNum) == 'number') {
			this.showFirstTimer = setTimeout(function () {
				_this.curPptIndex = _this.hashNum - 1;
				_this.showItem(_this.hashNum - 1);
				_this.showPageIndex(_this.hashNum);
			}, 500);
		} else {
			this.showFirstTimer = setTimeout(function () {
				_this.showItem(0);
				_this.showPageIndex(1);//显示当前页数和总页数
			}, 500);
		}
	}
	//初始化每张PPT的样式
	ppt.prototype.initStyle = function (ele) {
		//设置ppt的样式
		this.setCss(ele, {
			'width': '100%',
			'height': '100%',
			'overflow': 'hidden',
			'position': 'absolute',
			'top': 0,
			'left': 0,
			'padding': '20px',
			'box-sizing': 'border-box',
			'background-color': this.backgroundColor
		});
	}
	//初始化其他相关样式
	ppt.prototype.initOtherStyle = function () {
		//提供了一个.pptCenter类，为用户提供方便
		var pptCenters = document.getElementsByClassName('pptCenter');
		for (var i = 0; i < pptCenters.length; i++) {
			this.setCss(pptCenters[i], {
				'position': 'absolute',
				'left': '50%',
				'top': '50%',
				'transform': 'translate(-50%,-50%)'
			});
		}
		//设置HTML、body的样式
		this.setCss(document.documentElement, {
			'width': '100%',
			'height': '100%',
			'overflow': 'hidden'
		});
		this.setCss(document.body, {
			'width': '100%',
			'height': '100%',
			'overflow': 'hidden',
			'background-color': this.bodyBroundColor
		});
	}
	//返回当前PPT实例的所有PPT页实例组成的数组
	ppt.prototype.getAllPpts = function () {
		return this.ppts;
	}
	//返回当前PPT实例的所有PPT页实例数，即PPT页数
	ppt.prototype.getPptsLen = function () {
		return this.len;
	}
	//返回当前PPT实例中的某页PPT的带.pptItem类的元素所组成的数组,index为1~页数
	ppt.prototype.getPptItemsByIndex = function (index) {
		if (typeof index != "number" || parseInt(index) <= 0 || parseInt(index) > this.len) {
			return false;
		}
		return this.ppts[index - 1].items;
	}
	//返回当前PPT实例中的某页PPT的带.lazyPpt类的元素所组成的数组,index为1~页数
	ppt.prototype.getLazyPptsByIndex = function (index) {
		if (typeof index != "number" || parseInt(index) <= 0 || parseInt(index) > this.len) {
			return false;
		}
		return this.ppts[index - 1].lazyitems;
	}
	//通过背景颜色来推算当前应该使用的颜色
	ppt.prototype.computeDefaultColor = function (curIndex) {
		if (this.defaultColor) {
			return this.defaultColor;
		}
		var curPageBackgroundColor = this.getCss(this.ppts[curIndex].con, 'background-color');
		if (curPageBackgroundColor == 'rgb(255, 255, 255)' || curPageBackgroundColor == '#fff' || curPageBackgroundColor == '#ffffff') {
			return '#000';
		} else {
			return '#fff';
		};
	}
	//显示当前页数和总页数
	ppt.prototype.showPageIndex = function (cur) {
		var _this = this;
		if (!this.$id('pptPageIndexShowBox')) {
			var pageIndexBox = document.createElement('div');
			pageIndexBox.id = 'pptPageIndexShowBox';
		} else {
			var pageIndexBox = this.$id('pptPageIndexShowBox');
		};
		//动态计算ppt张数，我觉得一般人PPT也不可能做一百页以上，但是万一总有奇葩，那不就被他发现bug了么，厉害的我是不会让这种事情发生的，我就不信有人超过一千张
		var fontSize = '20px';
		if (this.len > 99) {
			fontSize = '15px';
		}
		var _defaultColor = this.computeDefaultColor(cur - 1);
		this.actualCurrentIndex = cur - 1;
		this.setCss(pageIndexBox, {
			'right': '10px',
			'bottom': '10px',
			'position': 'fixed',
			'z-index': 9999,
			'font-size': fontSize,
			'width': '70px',
			'height': '70px',
			'line-height': '70px',
			'text-align': 'center',
			'color': _defaultColor,
			'border': '1px solid ' + _defaultColor,
			'border-radius': '50%',
			'cursor': 'pointer'
		});
		this.html(pageIndexBox, cur + '/' + this.len);
		document.body.appendChild(pageIndexBox);
		//绑定全屏切换事件、鼠标以上提示该按钮可以控制全屏事件
		if (this.onlyOneBindFullScreenEvent) {
			var _ppisb = document.getElementById("pptPageIndexShowBox");
			var _oldText;
			this.on(_ppisb, 'mouseenter', function () {
				_oldText = _ppisb.innerHTML;
				_this.setCss(_ppisb, { 'font-size': '14px' });
				if (!_this.curFullScreenState) {
					_ppisb.innerHTML = '单击全屏';
				} else {
					_ppisb.innerHTML = '退出全屏';
				}
			});
			this.on(_ppisb, 'mouseleave', function () {
				_ppisb.innerHTML = _oldText;
				_this.setCss(_ppisb, { 'font-size': fontSize });
			});
			this.on(_ppisb, 'click', function () {
				if (!_this.curFullScreenState) {
					_this.enterFullScreen();
					_this.curFullScreenState = true;
				} else {
					_this.exitFullScreen();
					_this.curFullScreenState = false;
				}
			});
			this.onlyOneBindFullScreenEvent = false;
		}
	}
	//改变页面hash值
	ppt.prototype.changeHash = function (cur) {
		window.location.hash = '#' + cur;
	}
	//获取hsah值
	ppt.prototype.getHash = function () {
		return window.location.hash.substring(1);
	}
	//创建进度条
	ppt.prototype.createProgressBar = function () {
		var ele = document.createElement('div');
		ele.id = 'pptProgressBar';
		this.setCss(ele, {
			'position': 'fixed',
			'width': '0',
			'height': '5px',
			'left': 0,
			'bottom': 0,
			'transition': 'width 0.3s ease-in-out'
		});
		this.progressBarEle = ele;
		document.body.appendChild(ele);
	}
	//进度条
	ppt.prototype.updateProgressBar = function (curIndex) {
		if (!this.progressBar) {
			return false;
		}
		var color = this.computeDefaultColor(curIndex - 1);
		this.setCss(this.progressBarEle, {
			'width': (curIndex - 1) / (this.len - 1) * 100 + '%',
			'background-color': color
		});
	}
	//将幻灯片隐藏1(渐现)、2(旋转)、3(缩小)、4(放大)
	ppt.prototype.hideRightOrBottom = function (ele) {
		var _this = this;
		if (this.direction == 'v') {//垂直
			this.setCss(ele, {
				'top': '100%'
			});
		} else {//水平
			this.setCss(ele, {
				'left': '100%'
			});
		}
		this.changeCoolStyle(ele);
	}
	//将幻灯片隐藏
	ppt.prototype.hideLeftOrTop = function (ele) {
		var _this = this;
		if (this.direction == 'v') {//垂直
			this.setCss(ele, {
				'top': '-100%'
			});
		} else {//水平
			this.setCss(ele, {
				'left': '-100%'
			});
		}
		this.changeCoolStyle(ele);
	}
	//切换特效设置
	ppt.prototype.changeCoolStyle = function (ele) {
		var _this = this;
		this.setCss(ele, {
			'transition': 'all ' + _this.duration + 's ' + _this.easeing
		});
		switch (this.transitionType) {
			case 0:
				break;
			case 1:
				this.setCss(ele, {
					'opacity': 0
				});
				break;
			case 2:
				this.setCss(ele, {
					'transform': 'rotate(360deg)'
				});
				break;
			case 3:
				this.setCss(ele, {
					'transform': 'scale(1.1)'
				});
				break;
			case 4:
				this.setCss(ele, {
					'transform': 'scale(0.8)'
				});
				break;
		}
	}
	//切换特效设置
	ppt.prototype.changeCoolStyle2 = function (ele) {
		var _this = this;
		this.setCss(ele, {
			'transition': 'all ' + _this.duration + 's ' + _this.easeing
		});
		switch (this.transitionType) {
			case 0:
				break;
			case 1:
				this.setCss(ele, {
					'opacity': 1
				});
				break;
			case 2:
				this.setCss(ele, {
					'transform': 'rotate(0deg)'
				});
				break;
			case 3:
				this.setCss(ele, {
					'transform': 'scale(1)'
				});
				break;
			case 4:
				this.setCss(ele, {
					'transform': 'scale(1)'
				});
				break;
		}
	}
	//显示幻灯片
	ppt.prototype.show = function (ele) {
		var _this = this;
		if (this.direction == 'v') {//垂直
			this.setCss(ele, {
				'top': '0%'
			});
		} else {//水平
			this.setCss(ele, {
				'left': '0%'
			});
		}
		this.changeCoolStyle2(ele);
	}
	//根据索引显示某张幻灯片
	ppt.prototype.showItem = function (index) {
		this.hideOther(index);
		this.show(this.ppts[index].con);
	}
	//根据索引将幻灯片隐藏到左边
	ppt.prototype.hideLeftItem = function (index) {
		this.hideLeftOrTop(this.ppts[index].con);
	}
	//根据索引将幻灯片隐藏到右边
	ppt.prototype.hideRightItem = function (index) {
		this.hideRightOrBottom(this.ppts[index].con);
	}
	//根据当前显示的索引来分别隐藏大于和小于当前索引的幻灯片
	ppt.prototype.hideOther = function (index) {
		for (var i = 0; i < this.len; i++) {
			if (i < index) {
				this.hideLeftItem(i);
			} else if (i > index) {
				this.hideRightItem(i);
			}
		}
	}
	//绑定按键事件，主要是方向键事件
	ppt.prototype.handleDir = function () {
		var _this = this;
		this.on(document, 'keyup', function (e) {
			switch (e.keyCode) {
				case 37://上一张
					_this.showWhatKeyUp(1);
					_this.throttle(_this.dirLeft, _this);
					break;
				case 38://高亮上一个
					_this.showWhatKeyUp(2);
					_this.showUp();
					break;
				case 39://下一张
					_this.showWhatKeyUp(3);
					_this.throttle(_this.dirRight, _this);
					break;
				case 40://高亮下一个
					_this.showWhatKeyUp(4);
					_this.showDown();
					break;
			}
		});
	}
	//方向上键
	ppt.prototype.showUp = function () {
		this.ppts[this.curPptIndex].upEvent();
	}
	//方向下键
	ppt.prototype.showDown = function () {
		this.ppts[this.curPptIndex].downEvent();
	}
	//上一张
	ppt.prototype.dirLeft = function () {
		if (this.curPptIndex <= 0) {
			return;
		}
		this.curPptIndex--;
		this.changeComMethod();
	}
	//下一张
	ppt.prototype.dirRight = function () {
		if (this.curPptIndex >= this.len - 1) {
			return;
		}
		this.curPptIndex++;
		this.changeComMethod();
	}
	//切换公共方法
	ppt.prototype.changeComMethod = function () {
		//执行PPT的切换前的方法
		var _events = this.ppts[this.curPptIndex].events;
		for (var i = 0; i < _events.length; i++) {
			if (_events[i].type == 'start') {
				_events[i].fn(this.curPptIndex + 1);
			}
		}
		this.showItem(this.curPptIndex);
		this.changeHash(this.curPptIndex + 1);
		this.showPageIndex(this.curPptIndex + 1);
		this.updateProgressBar(this.curPptIndex + 1);
	}
	//自动播放
	ppt.prototype.autoPlay = function () {

	}
	//生成四个方向键图标
	ppt.prototype.creatDirBox = function () {
		var _color = '#fff';
		var dirBox = document.createElement('div');
		dirBox.id = 'dirBox';
		this.setCss(dirBox, {
			'position': 'fixed',
			'z-index': 999999,
			'right': '10px',
			'bottom': '85px',
			'width': '70px',
			'height': '70px',
			'border-radius': '50%'
		});
		//左-----------------
		var leftDirBox = document.createElement('div');
		leftDirBox.id = 'leftDirBox';
		this.setCss(leftDirBox, {
			'position': 'absolute',
			'width': '100%',
			'height': '100%',
			'opacity': 0
		})
		var leftDir1 = document.createElement('p');
		leftDir1.className = 'dirShow1';
		var leftDir2 = document.createElement('p');
		leftDir2.className = 'dirShow2';
		this.setCss(leftDir1, {
			'width': '30px',
			'height': '10px',
			'background': _color,
			'position': 'absolute',
			'right': '13px',
			'top': '30px'
		});
		this.setCss(leftDir2, {
			'width': '0px',
			'height': '0px',
			'position': 'absolute',
			'left': '-3px',
			'top': '20px',
			'border': '15px solid transparent',
			'border-right-color': _color
		});
		leftDirBox.appendChild(leftDir1);
		leftDirBox.appendChild(leftDir2);
		//右
		var rightDirBox = document.createElement('div');
		rightDirBox.id = 'rightDirBox';
		this.setCss(rightDirBox, {
			'position': 'absolute',
			'width': '100%',
			'height': '100%',
			'opacity': 0
		});
		var rightDir1 = document.createElement('p');
		rightDir1.className = 'dirShow1';
		var rightDir2 = document.createElement('p');
		rightDir2.className = 'dirShow2';
		this.setCss(rightDir1, {
			'width': '30px',
			'height': '10px',
			'background': _color,
			'position': 'absolute',
			'left': '13px',
			'top': '30px'
		});
		this.setCss(rightDir2, {
			'width': '0px',
			'height': '0px',
			'position': 'absolute',
			'left': '43px',
			'top': '20px',
			'border': '15px solid transparent',
			'border-left-color': _color
		});
		rightDirBox.appendChild(rightDir1);
		rightDirBox.appendChild(rightDir2);
		//上
		var upDirBox = document.createElement('div');
		upDirBox.id = 'upDirBox';
		this.setCss(upDirBox, {
			'position': 'absolute',
			'width': '100%',
			'height': '100%',
			'opacity': 0
		})
		var upDir1 = document.createElement('p');
		upDir1.className = 'dirShow1';
		var upDir2 = document.createElement('p');
		upDir2.className = 'dirShow2';
		this.setCss(upDir1, {
			'width': '10px',
			'height': '30px',
			'background': _color,
			'position': 'absolute',
			'left': '30px',
			'bottom': '13px'
		});
		this.setCss(upDir2, {
			'width': '0px',
			'height': '0px',
			'position': 'absolute',
			'left': '20px',
			'top': '-3px',
			'border': '15px solid transparent',
			'border-bottom-color': _color
		});
		upDirBox.appendChild(upDir1);
		upDirBox.appendChild(upDir2);
		//下
		var downDirBox = document.createElement('div');
		downDirBox.id = 'downDirBox';
		this.setCss(downDirBox, {
			'position': 'absolute',
			'width': '100%',
			'height': '100%',
			'opacity': 0
		})
		var downDir1 = document.createElement('p');
		downDir1.className = 'dirShow1';
		var downDir2 = document.createElement('p');
		downDir2.className = 'dirShow2';
		this.setCss(downDir1, {
			'width': '10px',
			'height': '30px',
			'background': _color,
			'position': 'absolute',
			'left': '30px',
			'top': '13px'
		});
		this.setCss(downDir2, {
			'width': '0px',
			'height': '0px',
			'position': 'absolute',
			'left': '20px',
			'top': '43px',
			'border': '15px solid transparent',
			'border-top-color': _color
		});
		downDirBox.appendChild(downDir1);
		downDirBox.appendChild(downDir2);

		Array.prototype.push.call(this.dirShowElemnt, leftDirBox, upDirBox, rightDirBox, downDirBox);

		dirBox.appendChild(leftDirBox);
		dirBox.appendChild(rightDirBox);
		dirBox.appendChild(upDirBox);
		dirBox.appendChild(downDirBox);
		document.body.appendChild(dirBox);
	}
	//显示当前按下了哪个键
	ppt.prototype.showWhatKeyUp = function (dir) {
		var _this = this,
			_timer = null;
		clearTimeout(_timer);
		this.changeKeyUpBoxColor(dir - 1);
		for (var i = 0; i < this.dirShowElemnt.length; i++) {
			if (i == dir - 1) {
				continue;
			}
			this.setCss(this.dirShowElemnt[i], { 'opacity': 0 });
		}
		_this.setCss(_this.dirShowElemnt[dir - 1], { 'opacity': 1 });
		_timer = setTimeout(function () {
			_this.setCss(_this.dirShowElemnt[dir - 1], { 'opacity': 0 });
			_this.setCss(document.getElementById("dirBox"), { 'border': '1px solid transparent' });
		}, 1000);
	}
	//动态为方向箭头改变颜色
	ppt.prototype.changeKeyUpBoxColor = function (dir) {
		if (dir == 0) {
			if (this.actualCurrentIndex > 0) {
				var _color = this.computeDefaultColor(this.actualCurrentIndex - 1);
			}
		} else if (dir == 2) {
			if (this.actualCurrentIndex < this.len - 1) {
				var _color = this.computeDefaultColor(this.actualCurrentIndex + 1);
			}
		} else {
			var _color = this.computeDefaultColor(this.actualCurrentIndex);
		}
		var _curDirBox = this.dirShowElemnt[dir];
		var _curDirBoxChildOne = _curDirBox.getElementsByClassName('dirShow1')[0];
		var _curDirBoxChildTwo = _curDirBox.getElementsByClassName('dirShow2')[0];
		this.setCss(_curDirBoxChildOne, { 'background': _color });
		this.setCss(document.getElementById("dirBox"), { 'border': '1px solid ' + _color });
		switch (dir) {
			case 0://左
				this.setCss(_curDirBoxChildTwo, { 'border-right-color': _color });
				break;
			case 1://上
				this.setCss(_curDirBoxChildTwo, { 'border-bottom-color': _color });
				break;
			case 2://右
				this.setCss(_curDirBoxChildTwo, { 'border-left-color': _color });
				break;
			case 3://下
				this.setCss(_curDirBoxChildTwo, { 'border-top-color': _color });
				break;
		}
	}
	//全屏
	ppt.prototype.enterFullScreen = function () {
		var element = document.documentElement;
		if (element.requestFullscreen) {
			element.requestFullscreen();
		} else if (element.mozRequestFullScreen) {
			element.mozRequestFullScreen();
		} else if (element.webkitRequestFullscreen) {
			element.webkitRequestFullscreen();
		} else if (element.msRequestFullscreen) {
			element.msRequestFullscreen();
		}
	}
	//退出全屏
	ppt.prototype.exitFullScreen = function () {
		if (document.exitFullscreen) {
			document.exitFullscreen();
		}
		else if (document.mozCancelFullScreen) {
			document.mozCancelFullScreen();
		}
		else if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen();
		}
		else if (document.msExitFullscreen) {
			document.msExitFullscreen();
		}
	}
	//添加事件监听
	ppt.prototype.addListeners = function (type, callback, num) {
		var _types = this.eventTypes;//暂时只支持监听这两种事件
		if (_types.indexOf(type) == -1) {
			return;
		}
		callback = (typeof callback == 'function') ? callback : function () { };
		//为某页PPT加事件
		if (typeof Number(num) == 'number' && num > 0 && num <= this.len) {
			this.ppts[num - 1].events.push({
				'type': type,
				'fn': callback
			});
		} else {//为所有的PPT加事件
			for (var i = 0; i < this.ppts.length; i++) {
				this.ppts[i].events.push({
					'type': type,
					'fn': callback
				});
			}
		}
	}
	//删除事件监听
	ppt.prototype.removeListeners = function (type, num) {
		if (this.eventTypes.indexOf(type) == -1) {
			return;
		}
		if (typeof Number(num) == 'number' && num > 0 && num <= this.len) {
			var _events = this.ppts[num - 1].events;
			for (var i = 0; i < _events.length; i++) {
				if (_events[i].type == type) {
					this.ppts[num - 1].events.splice(i, 1);
					i--;
				}
			}
		} else {
			for (var i = 0; i < this.ppts.length; i++) {
				_newArr = [];
				for (var j = 0; j < this.ppts[i].events.length; j++) {
					console.log(this.ppts[i].events.length, 'aaaaaa')
					if (this.ppts[i].events[j].type == type) {
						this.ppts[i].events.splice(j, 1);
						j--;
					}

				}
			}
		}
	}
	//给某张PPT特别设置背景颜色
	ppt.prototype.addBackgroundByIndex = function (index, color) {
		if (typeof Number(index) !== 'number' || parseInt(Number(index)) <= 0 || parseInt(Number(index)) > this.len) {
			return false;
		}
		this.setCss(this.ppts[index - 1].con, {
			'background': color
		});
	}
	//节流函数，主要是避免切换过快造成白屏
	ppt.prototype.throttle = function (fn, ctx) {
		var _this = this;
		if (!this.throttleFlag) {
			return;
		}
		this.throttleFlag = false;
		fn.call(ctx);
		setTimeout(function () {
			_this.throttleFlag = true;
		}, _this.duration * 1000);
	}

	window.ppt = ppt;

})();