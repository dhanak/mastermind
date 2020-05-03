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
			won: false,
		},
		methods: {
			start: start,
			keepGuessing: function() { this.n_best = 2; },
			win: win,
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
	app.won = false;
	app.words = dictionary.map(word => { return { w: word, s: 0 }; });
	app.history = [];
	makeGuess();
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

function makeGuess() {
	const s0 = app.words[0].s;
	bests = app.words.filter(w => w.s == s0);
	app.n_best = bests.length;
	if (bests.length > 1) { // filter last guessed word to avoid repetitions
		bests = bests.filter(w => w.w != app.guess);
	}
	app.guess = bests[Math.floor(Math.random() * bests.length)].w;
}

function submit() {
	const form = document.forms[0];
	const exact = parseInt(form.exact.value) || 0;
	const misplaced = parseInt(form.misplaced.value) || 0;
	evaluate(app.guess, exact, misplaced);
	if (!app.won) {
		makeGuess();
	}
}

function evaluate(guess, exact, misplaced) {
	if (exact == 5) {
		win();
	} else {
		app.history.push({ guess:guess, exact:exact, misplaced:misplaced });
		app.words = app.words.filter(w => w.w != guess);
		for (var w of app.words) {
			const s = score(guess, w.w);
			w.s += (Math.abs(exact - s.exact) + Math.abs(misplaced - s.misplaced) +
				Math.abs(exact + misplaced - s.exact - s.misplaced)) / 2;
		}
		app.words.sort((a, b) => a.s - b.s);
	}
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
	return { exact: e, misplaced: m };
}

function win() {
	app.won = true;
	checkHistory();
}

function checkHistory() {
	for (var i = 0; i < app.history.length; i++) {
		const h = app.history[i];
		var s = score(app.guess, h.guess);
		for (var t of ['exact', 'misplaced']) {
			if (s[t] != h[t]) {
				s['bad-' + t] = h[t];
			}
		}
		if (Object.keys(s).length > 2) {
			s.guess = h.guess;
			Vue.set(app.history, i, s);
		}
	}
}

function replay(log) {
	start();
	// convert log if it's a string
	if (typeof("log") == "string") {
		var tokens = log.split(/\s+/);
		var guesses = [];
		while (tokens.length) {
			guesses.push(tokens.splice(0, 3));
		}
		log = [];
		for (g of guesses) {
			log.push({
				guess: g[0],
				exact: parseInt(g[1]) || 0,
				misplaced: parseInt(g[2]) || 0,
			});
		}
	}
	// replay log
	while (log.length) {
		const entry = log.shift();
		evaluate(entry.guess, entry.exact, entry.misplaced);
	}
	makeGuess();
}