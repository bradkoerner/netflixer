OMDB_APIKEY = '';

locations = {
	slider_item: '.slider-item',

	title_card: '.jawBone',
	title_text: '.jawBone div.text',
	title_logo: '.jawBone img',

	info         : '.jawBone .jawBoneCommon .jawbone-overview-info .meta',
	info_year    : '.jawBone .jawBoneCommon .jawbone-overview-info .meta .year',
	info_duration: '.jawBone .jawBoneCommon .jawbone-overview-info .meta .duration',
	info_plot    : '.jawBone .jawBoneCommon .jawbone-overview-info span .synopsis',

	overview_button: '.jawBone .Overview'
}

stored_movies = {};

function processCall() {
	movie = extractMovieInfo();
	console.log(movie);
	getMovieData(movie);
}

function extractMovieInfo() {
	var movie = {
		title: '',
		year : $(locations.info_year).text(),
		type : ($(locations.info_duration).text().indexOf('Season') > -1 
			|| $(locations.info_duration).text().indexOf('Series') > -1 
			|| $(locations.info_duration).text().indexOf('Volume') > -1) ? 'series' : 'movie'
	};

	if ($(locations.title_text).length != 0) {
		// Movie in normal text
		movie.title = $(locations.title_text).text();
	} else {
		// Movie uses logo
		movie.title = cleanTitle($(locations.title_logo).attr('alt'));
	}

	return movie;
}

function getMovieData(movie) {
	if (stored_movies[movie.title]) {
		fetchSavedData(movie);
	} else {
		searchNewData(movie);
	}
}

function searchNewData(movie) {
	var url = 'https://www.omdbapi.com/'
		+'?t=' + movie.title.replace(/ /g, '+');
		+ '&type=' + movie.type;

	// Netflix doesn't display the original TV show year so this will break TV search
	if (movie.type == 'movie') {
		url += '&y=' + movie.year;
	}

	$.ajax({
		url    : url + '&apikey='+OMDB_APIKEY,
		success: function (response) {
			stored_movies[movie.title] = {
				ratings: {
					imdb      : response.imdbRating,
					metacritic: response.Metascore
				},
				ids    : {
					imdb: response.imdbID
				},
				plot   : response.Plot
			};

			displayRatings(stored_movies[movie.title].ratings, stored_movies[movie.title].ids);
			if (movie.type == 'movie') {
				displayPlot(stored_movies[movie.title].plot);
			}
		}
	});
}

function cleanTitle(title) {
	title = title.split(" (")[0];
	return title;
}

function fetchSavedData(movie) {
	displayRatings(stored_movies[movie.title].ratings, stored_movies[movie.title].ids);
	if (movie.type == 'movie') {
		displayPlot(stored_movies[movie.title].plot);
	}
}

function parseRatings(ratings) {
	data = {};

	for (var i = 0; i < ratings.length; i++) {
		switch (ratings[i].Source) {
			case "Internet Movie Database":
			data.imdb = ratings[i].Value;
			break;
		}
	}

	return data;
}

function displayRatings(ratings, ids) {
	console.log($(locations.info));
	$(locations.info).append('<span style="color: #f3ce13;"><a href="https://www.imdb.com/title/'+ids.imdb+'" target="_blank"><img src="https://i.imgur.com/VPukLYr.png" height="8">&nbsp;'+ratings.imdb+'/10&nbsp;</a></span>');
	$(locations.info).append('<span>&nbsp;<img src="https://i.imgur.com/Hie5f67.png" height="8"></a>&nbsp;'+ratings.metacritic+'/100</span>');
}

function displayPlot(plot) {
	$(locations.info_plot).after('<div style="color: #f3ce13;">' + plot + '</div>')
}

$('body').click(function(event) {
	var el = $(event.target);

	if (el.hasClass('bob-jaw-hitzone')) {
		setTimeout(processCall, 250);

		setTimeout(function() {
			$(locations.overview_button).on('click', function() {
				console.log('clicked');
				setTimeout(processCall, 50);
			});
		}, 200);

		// setTimeout(function() {
		// 	$(locations.slider_item).hover(function() {
		// 		console.log('hover');
		// 		processCall();
		// 	});
		// }, 200);
	}
});

console.log('extension working!');