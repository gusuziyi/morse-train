$(function() {
	initWidget();
	var currentMessage = {
		showDivInfo: {}
	}
	initBtn(currentMessage);
});

function getmorse() { //初始化各类型莫尔斯码
	var longNum = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9');
	var longNumMorse = new Array("-----",
		".----", "..---", "...--", "....-", ".....", "-....",
		"--...", "---..", "----.");
	var shortNum = longNum;
	var shortNumMorse = new Array("-", ".-", "..-", "...--", "....-",
		".", "-....", "--.", "-..", "-.");
	var letter = new Array(...'abcdefghijklmnopqrstuvwxyz')
	var letterMorse = new Array(
		".-", "-...", "-.-.", "-..", ".", "..-.",
		"--.", "....", "..", ".---", "-.-", ".-..",
		"--", "-.", "---", ".--.", "--.-", ".-.",
		"...", "-", "..-", "...-", ".--", "-..-",
		"-.--", "--.."
	);
	var mix = new Array(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ .,?:-!0123456789'); // short+word
	var mixMorse = new Array(
		".-", "-...", "-.-.", "-..", ".", "..-.",
		"--.", "....", "..", ".---", "-.-", ".-..",
		"--", "-.", "---", ".--.", "--.-", ".-.",
		"...", "-", "..-", "...-", ".--", "-..-",
		"-.--", "--..", ".-", "-...", "-.-.", "-..",
		".", "..-.", "--.", "....", "..", ".---",
		"-.-", ".-..", "--", "-.", "---", ".--.",
		"--.-", ".-.", "...", "-", "..-", "...-",
		".--", "-..-", "-.--", "--..", ' ', ".-.-.-",
		"--..--", "..--..", "---...", "-....-", "!", "-----",
		".----", "..---", "...--", "....-", ".....", "-....",
		"--...", "---..", "----.");
	var word = new Array("   AR(pause)   ", "   AS(wait)   ", "   K(request)   ", "   SK(stop)   ", "   BT(separation)   ",
		"   QRL(frequency   busy)   ", "   QRZ(who   calling   me)   ", "   QSL(understand)   ",
		"   QSY(change   frequency)   ",
		"   WX(weather)   ", "   YRS(years)   ", "   RPT(repeat)   ");
	var wordMorse = new Array(".-.-.", ".-...", "-.-", "...-.-", "-...-",
		"--.-.-..-..", "--.-.-.--..", "--.-....-..", "--.-...-.--", ".---..-", "-.--.-....", ".-..--.-");
	var morseObj = {
		long: {
			num: longNum,
			morse: longNumMorse
		},
		short: {
			num: shortNum,
			morse: shortNumMorse
		},
		word: {
			num: letter,
			morse: letterMorse
		},
		mix: {
			num: mix,
			morse: mixMorse
		},
		duty: {
			num: word,
			morse: wordMorse
		}
	};
	return morseObj;
}

function initBtn(currentMessage) {
	$("#noiseSelect").change(function() { //背景杂音选项
		if (!$("#noiseOff")[0].checked || !$("#begin").data('isOn')) {
			return //在背景开关关闭 或 未按下开始按钮时无效
		}
		playBg();
	});
	$("#create").click(function() {
		$("#create").data('switch', true)
		$('#showDiv').html('');
		$('#translateDiv').html('');
		var morseObj = getmorse();
		var messageType = "";
		var range = 0; //字典中的随机值
		var messageTemp = $("#messageType").val(); //报文类型
		if (!messageTemp) {
			$("#tips").html("请输入报文类型！");
			return false;
		}
		switch (messageTemp) {
			case '长码':
				messageType = 'long';
				range = 10;
				break;
			case '短码':
				messageType = 'short';
				range = 10;
				break;
			case '字码':
				messageType = 'word';
				range = 26;
				break;
			case '混合码':
				messageType = 'mix';
				range = 69;
				break;
			case '勤务用语':
				messageType = 'duty';
				range = 5;
				break;
			default:
				break;
		}
		currentMessage.showDivInfo = createMessage(morseObj[messageType], range);
	});

	$("#begin").click(function() {
		// console.log(currentMessage.showDivInfo.showDivMorse);
		// console.log($("#showDiv").val(),$("#create").data('switch'));
		if (!$("#begin").data('isOn')) {
			$("#begin").data('isOn', true).html('停止听写');
			if ($("#create").data('switch')) { //生成了报文
				var onmusic = currentMessage.showDivInfo.showDivMorse; //使用随机生成的报文
				var ontext = currentMessage.showDivInfo.showDivText;
				$("#translateDiv span:first").addClass("active") //首项dom标红
				$("#showDiv span:first").addClass("active")
			} else if (!$("#showDiv").val() && !$("#translateDiv").val()) { //翻译的报文

				currentMessage.showDivInfo = createTranslate(currentMessage); //使用翻译好的报文
				var onmusic = currentMessage.showDivInfo.showDivMorse;
			} else { //错误
				return
			}
			if ($("#noiseOff")[0].checked) { //背景开关开启
				playBg();
			}
			if ($('#messageSpeedT').val() == 0) { //未填写发报速度
				$("#tips").html("请输入发报速度！");
				return false;
			}
			var speed = $('#messageSpeedT').val(); //每分钟码速
			var beat = speed * 12 //每分钟点速  
			//12是利用霍夫曼对摩斯码编码,得到平均码长在R与K之间,每个词约48t,
			//48t * speed/4 =60000
			var perTime = 60000 / beat; //每个点时间
			var tempI = async function() {
				for (var i = 0; i < onmusic.length; i++) {
					var perMos = onmusic[i]; //.  -  'byte'  'word' or "end" 共五种状态
					try {
						await play(perTime, perMos);
					} catch (e) {
						console.log("用户暂停");
					}
				}
			}
			tempI();
		} else {
			$("#begin").data('isOn', false).html('开始听写');
			$("#translateDiv span").last().removeClass("active")
			$("#showDiv span").last().removeClass("active")
		}
	});
	$('#translate').click(function() {
		// console.log($('#translate').data('switch'));
		if (!$('#translate').data('switch')) { //打开
			$("#showDiv").css('display', 'none'); //报文div不可见
			$("#translateDiv").html(''); //清空翻译内容
			$("#inContent").attr({ //input可见
				'style': 'display:block;width:80%; height:40px;font-size:40px;line-height:40px;padding:5px;',
				'title': '输入报文后,请再次点击翻译按钮', //控制jqeryUI的toolkip
				'placeholder': '单击此处输入报文'
			}).val('')
			$('#translate').data('switch', true).html('马上翻译').css('color', "red") //按钮形态
				.siblings().attr('disabled', true).css('color', "grey") //siblings按钮形态
		} else { //翻译并关闭
			$("#inContent").css('display', 'none')
			var inContent = $("#inContent").val();
			$("#showDiv").css('display', 'block').html(inContent)
			goTranslate(inContent)
			currentMessage.showDivInfo.translateStr = $("#translateDiv").html()
			currentMessage.showDivInfo.showStr = $("#showDiv").html()
			$('#translate').data('switch', false).html('翻译报文')
			$(this).css('color', "#333").siblings().attr('disabled', false).css('color', "#333")
			$("#create").data('switch', false)
		}
	});
	$("#arti").click(function() {
		if (!$('#arti').data('switch')) { //打开
			$("#translateDiv").css('display', 'none');
			$("#showDiv").html('');
			$("#inMorse").attr({
				'style': 'display:block;width:80%; height:40px;font-size:40px;line-height:40px;',
				'title': '输入报文后,请再次点击翻译按钮',
				'placeholder': '单击此处输入报文'
			}).val('')
			$('#arti').data('switch', true).html('马上反译')
			$(this).css('color', "red").siblings().attr('disabled', true).css('color', "grey")
		} else { //翻译并关闭
			$("#inMorse").css('display', 'none')
			var inMorse = $("#inMorse").val();
			$("#translateDiv").css('display', 'block').html(inMorse)
			artiTranslate(inMorse)
			currentMessage.showDivInfo.translateStr = $("#translateDiv").html()
			currentMessage.showDivInfo.showStr = $("#showDiv").html()
			$('#arti').data('switch', false).html('反译报文')
			$(this).css('color', "#333").siblings().attr('disabled', false).css('color', "#333")
			$("#create").data('switch', false)
		}

	});
	$("#show").click(function() {
		if ($(this).hasClass("isShow")) {
			$(this).html("显示报文");
			$(this).removeClass("isShow");
			$("#showDiv").hide();
		} else {
			$(this).html("隐藏报文");
			$(this).addClass("isShow");
			$("#showDiv").show();
		}
	});
	$("#noiseOff").click(function() { //背景开关
		if (!$("#noiseOff")[0].checked) { //关闭
			closeBg()
		} else { //开启
			if ($("#begin").data('isOn'))
				playBg();
		}
	});
}

function goTranslate(inContent) {
	var reg = /[\u4e00-\u9fa5]/g;
	var hasChina = reg.test(inContent); //判断是否有中文
	if (!hasChina) { //无中文,使用混合码字典
		var letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ .,?:-!0123456789";
		var morse = new Array(
			".-", "-...", "-.-.", "-..", ".", "..-.",
			"--.", "....", "..", ".---", "-.-", ".-..",
			"--", "-.", "---", ".--.", "--.-", ".-.",
			"...", "-", "..-", "...-", ".--", "-..-",
			"-.--", "--..", ".-", "-...", "-.-.", "-..",
			".", "..-.", "--.", "....", "..", ".---",
			"-.-", ".-..", "--", "-.", "---", ".--.",
			"--.-", ".-.", "...", "-", "..-", "...-",
			".--", "-..-", "-.--", "--..", " ", ".-.-.-",
			"--..--", "..--..", "---...", "-....-", "!", "-----",
			".----", "..---", "...--", "....-", ".....", "-....",
			"--...", "---..", "----.");
		var findArr = [...inContent];
		var outStr = '';
		findArr.forEach(function(i) {
			var letterIndex = letters.indexOf(i);
			var morsePer = morse[letterIndex];
			outStr += morsePer;
		});
	} else { //是中文,中文解码
		var option = {
			space: '  ',
			long: '-',
			short: '.'
		};
		var outStr = xmorse.encode(inContent, option);
	}
	console.log(inContent + "  译码为  " + outStr);

	$("#translateDiv").html(outStr);
}

function artiTranslate(inMorse) { //反译
	var option = {
		space: ' ',
		long: '-',
		short: '.'
	};
	var reg = /^[.-]/g
	var isMorse = reg.test(inMorse)
	if (isMorse) {
		var outStr = xmorse.decode(inMorse, option);
		console.log(inMorse + "  反译码为  " + outStr);
		$("#showDiv").html(outStr);
	} else {
		var outStr = xmorse.encode(inMorse, option);
		console.log(inMorse + "  译码为  " + outStr);
		$("#showDiv").html(inMorse);
		$("#translateDiv").html(outStr);
	}
}

function playBg() {
	var bgName = $("#noiseSelect").val();
	var bgSrc = 'support/' + bgName + ".mp3";
	$("#bg").attr({
		'src': bgSrc,
		'loop': 'loop'
	});
	$("#bg")[0].play();
}

function closeBg() {
	$("#bg")[0].pause();
	$("#bg").attr({
		'src': ""
	});
}

async function play(perTime, perMos) {
	if (!$("#begin").data('isOn'))
		throw 0
	console.log(perMos);
	switch (perMos) {
		case ".":
			await playAudio(perTime);
			break;
		case "-":
			await playAudio(perTime * 3);
			break;
		case "byte":
			await sleep(2 * perTime);
			break;
		case "word":
			await sleep(6 * perTime);
			$('#showDiv span.active').toggleClass('active').next().addClass('active')
			$('#translateDiv span.active').toggleClass('active').next().addClass('active')
			break;
		case "end":
			if ($('#noiseOff')[0].checked)
				closeBg();
			break;
		default:
			break;
	}

}

async function playAudio(perTime) {
	await playDot(perTime)
	await sleep(perTime);
	//若外接播放音频,在此处添加
	/* $("#morseMp3").attr({
	 	"src": "support/2.mp3"
	   });
	   $("#morseMp3")[0].play();
	*/
};

function sleep(time) { //异步休眠
	return new Promise((resolve, reject) => {
		setTimeout(resolve, time);
		// console.log('sleep' + time)
	});
}

function createTranslate(currentMessage) {
	var translateStr = currentMessage.showDivInfo.translateStr
	var showStr = currentMessage.showDivInfo.showStr
	$("#showDiv").html('')
	$("#translateDiv").html('')
	var translateArr = translateStr.trim().split(' ')
	var showArr = [...showStr.trim()]
	var palyArr = [...translateStr]
	var letterNums = palyArr.length;
	var showDivMorse = [];
	var wordIndex = 0;
	var dotIndex = 0;
	var letterStart = 0;
	var tranNum = translateArr.length;
	var showNum = showArr.length;
	while (tranNum) {
		var dotSpan = document.createElement('span');
		while ($.trim(translateArr[dotIndex]).length == 0 || translateArr[dotIndex] === undefined) {
			translateArr.splice(dotIndex, 1)
			tranNum--
		}
		var dotP = document.createTextNode(translateArr[dotIndex]);
		dotSpan.appendChild(dotP);

		if (dotIndex == 0) { //第一次生成,添加class
			dotSpan.className = 'active';
		}
		$("#translateDiv").append(dotSpan)
		dotIndex++
		tranNum--
	}
	while (showNum) {
		var aSpan = document.createElement('span');
		while ($.trim(showArr[wordIndex]).length == 0 || showArr[wordIndex] === undefined) {
			showArr.splice(wordIndex, 1)
			showNum--
		}
		var aP = document.createTextNode(showArr[wordIndex]);
		aSpan.appendChild(aP);

		if (wordIndex == 0) { //第一次生成,添加class
			aSpan.className = 'active';
		}
		$("#showDiv").append(aSpan)
		wordIndex++
		showNum--
	}
	while (letterNums) { //为0时生成最后一组
		var morseTemp = palyArr[letterStart]

		if (morseTemp != ' ') {
			showDivMorse.push(morseTemp);
		} else {
			if (palyArr[letterStart + 1] != ' ') {
				showDivMorse.push('word');
			}
		}
		letterStart++;
		letterNums--;
	}
	showDivMorse.push('end'); //while结束
	// console.log(translateArr, showArr, palyArr);
	var showDivInfo = {
		showDivMorse: showDivMorse,
		translateStr: translateStr,
		showStr: showStr
	};
	return showDivInfo;
}

function createMessage(morse, range) { //生成随机报文
	if ($("#messageType").val() != '勤务用语')
		var letterNums = $("#messageGroupT").val() * 4;
	else
		var letterNums = $("#messageGroupT").val()
	var spaceTemp = 0; //for output %4   
	var showDivText = "";
	var showDivMorse = [];
	var translate = '';
	var word = '';
	var dotWord = '';
	if (spaceTemp == 0) { //第一次生成,添加class
		word = "准备开始"
		dotWord = "-...-"
		var start = "-...-"
		for (var i = 0; i < 5; i++) {
			showDivMorse.push(start[i])
		}
	}
	while (letterNums > -1) { //为0时生成最后一组
		var randomNum = Math.floor(Math.random() * range);
		if (spaceTemp % 4 == 0) { //每四个输出一个空格,用于排版
			var aSpan = document.createElement('span');
			var aP = document.createTextNode(word);
			aSpan.appendChild(aP);
			showDivMorse.push('word');
			//每4个作为一个word,生成一个span用作包装
			var dotSpan = document.createElement('span');
			var dotP = document.createTextNode(dotWord);
			dotSpan.appendChild(dotP);
			word = '';
			dotWord = '';

			if (spaceTemp == 0) { //第一次生成,添加class
				aSpan.className = 'active';
				dotSpan.className = 'active';
			}
			$("#translateDiv").append(dotSpan)
			$("#showDiv").append(aSpan)
		}

		word += morse.num[randomNum];
		dotWord += morse.morse[randomNum];

		var morseTemp = morse.morse[randomNum]
		if (letterNums == 0) { //倒序遍历的letterNums,为零时最后一组四个丢弃
			word = '';
			dotWord = '';
			morseTemp = '';
		}
		if (morseTemp.length > 1) { //byte的morse不止一个点,离散处理 .-.  .,-,.
			let perMoss = [...morse.morse[randomNum]];
			console.log(perMoss);
			perMoss.forEach((i) => {
				showDivMorse.push(i);
			});
		} else { //只有一个点,比如e
			showDivMorse.push(morseTemp);
		}
		showDivMorse.push('byte');
		spaceTemp++;
		letterNums--;

	}
	word = "结束标志";
	dotWord = ".-.-.";
	var aSpan = document.createElement('span');
	var aP = document.createTextNode(word);
	aSpan.appendChild(aP);
	//每4个作为一个word,生成一个span用作包装
	var dotSpan = document.createElement('span');
	var dotP = document.createTextNode(dotWord);
	dotSpan.appendChild(dotP);
	for (var i = 0; i < 5; i++) {
		showDivMorse.push(dotWord[i])
	}
	showDivMorse.push('end'); //while结束
	$("#translateDiv").append(dotSpan)
	$("#showDiv").append(aSpan)
	$("#showDiv span").first().css('display',"block")
	$("#showDiv span").last().css('display',"block")


	var showDivInfo = {
		showDivText: showDivText,
		showDivMorse: showDivMorse,
		translate: translate
	};
	// console.log(showDivInfo);
	return showDivInfo;
}

function initWidget() { //初始化jq_ui组件
	$("#messageGroup").slider({
		range: 'min',
		min: 0,
		value: 10,
		max: 300,
		step: 10,
		slide: function(e, ui) {
			$("#messageGroupT").val(ui.value);
		}
	});

	$("#messageSpeed").slider({
		range: 'min',
		min: 0,
		value: 100,
		max: 500,
		step: 10,
		slide: function(e, ui) {
			$("#tips").html("");
			$("#messageSpeedT").val(ui.value);
		}
	});

	$("#noiseSelect").button();
	$("#noiseOff").buttonset();
	$("#noiseStrong").spinner({
		max: 2,
		min: -2,
		step: 1,
		//设置微调按钮递增/递减事件 
		spin: function(event, ui) {
			if (!$("#noiseOff")[0].checked || !$("#begin").data('isOn')) { //噪声按钮关闭 或 未按下开始听写
				return
			}
			$("#bg")[0].volume = 0.25 * ui.value + 0.5;
			// console.log(0.25 * ui.value + 0.5);
		},
		//设置微调按钮值改变事件
		change: function(event, ui) {
			if (!$("#noiseOff")[0].checked || !$("#begin").data('isOn')) {
				return
			}
			var intTmp = $(this).spinner("value");
			$("#bg")[0].volume = 0.25 * intTmp + 0.5
		}

	});
	$(":button").button();
	$(document).tooltip();
}

function playDot(perTime) { //生成点
	return new Promise(function(resolve, reject) {
		var sound = new Pizzicato.Sound({ //正弦波440赫兹
			source: 'wave',
			options: {
				frequency: 440
			}
		});

		sound.play();
		setTimeout(function() {
			resolve(sound.stop())
		}, perTime)
	});
}

function playLine() { //生成划
	return new Promise(function(resolve, reject) {
		var Synth = function(audiolet, frequency) {
			AudioletGroup.apply(this, [audiolet, 0, 1]);
			this.sine = new Sine(this.audiolet, frequency);
			this.modulator = new Saw(this.audiolet, frequency * 2);
			this.modulatorMulAdd = new MulAdd(this.audiolet, frequency / 2,
				frequency);

			this.gain = new Gain(this.audiolet);
			this.envelope = new PercussiveEnvelope(this.audiolet, 1, 0.001, 0.3,
				function() {
					this.audiolet.scheduler.addRelative(0,
						this.remove.bind(this));
				}.bind(this)
			);

			this.modulator.connect(this.modulatorMulAdd);
			this.modulatorMulAdd.connect(this.sine);

			this.envelope.connect(this.gain, 0, 1);
			this.sine.connect(this.gain);

			this.gain.connect(this.outputs[0]);
		};
		extend(Synth, AudioletGroup);

		var AudioletApp = function() {
			this.audiolet = new Audiolet();
			var synth = new Synth(this.audiolet, 880);
			synth.connect(this.audiolet.output);
		};

		this.audioletApp = new AudioletApp();

	});
}
