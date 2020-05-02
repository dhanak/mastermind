var app;
var dictionary = [];

function main() {
	app = new Vue({
		el: '#app',
		data: {
			guess: "?????",
			words: [],
			n_best: 0,
			history: [],
		},
		methods: {
			start: start,
		}
	});

	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'words.json', true);
	xhr.onload = function (e) {
		if (this.status == 200) {
			dictionary = JSON.parse(this.response);
			// start();
		}
	}
	xhr.send();
}

function start() {
	resetForm();
	app.words = dictionary.map(word => { return { 'w': word, 's': 0 }; });
	app.history = [];
	nextWord();
}

function resetForm() {
	var form = document.forms[0];
	form.reset();
	for (var type of ['exact', 'misplaced']) {
		for (var i of [0, 1, 2, 3, 4, 5]) {
			form.elements[`${type}-${i}`].parentElement.classList.remove('is-checked');
		}
	}
}

function nextWord() {
	const s0 = app.words[0]['s'];
	bests = app.words.filter(w => w['s'] == s0);
	app.n_best = bests.length;
	if (bests.length > 1) { // filter last guessed word to avoid repetitions
		bests = bests.filter(w => w['w'] != app.guess);
	}
	app.guess = bests[Math.floor(Math.random() * bests.length)]['w'];
}

function guess() {
	const form = document.forms[0];
	const exact = parseInt(form['exact'].value) || 0;
	const misplaced = parseInt(form['misplaced'].value) || 0;
	app.history.push({'guess':app.guess, 'exact':exact, 'misplaced':misplaced});
	for (w of app.words) {
		const s = score(app.guess, w['w']);
		w['s'] += Math.abs(exact - s['exact']) + Math.abs(misplaced - s['misplaced']);
	}
	app.words.sort((a, b) => a['s'] - b['s']);
	nextWord();
}

function score(w1, w2) {
	var e = 0;
	var m = 0;
	var r1 = [];
	var r2 = [];

	// count exact matches
	for (var i = 0; i < w1.length; i++) {
		if (w1[i] == w2[i]) {
			e++;
		} else {
			r1.push(w1[i]);
			r2.push(w2[i]);
		}
	}

	// count misplaced matches
	r1.sort();
	r2.sort();
	var i = 0;
	var j = 0;
	while (i < r1.length && j < r2.length) {
		if (r1[i] == r2[j]) {
			m++;
			i++;
			j++;
		} else if (r1[i] < r2[j]) {
			i++;
		} else {
			j++;
		}
	}
	return { 'exact': e, 'misplaced': m };
}
