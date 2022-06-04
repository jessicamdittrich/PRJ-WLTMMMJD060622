$("document").ready(function () {
	// API key
	const options = {
		method: 'GET',
		headers: {
			'X-RapidAPI-Host': 'yummly2.p.rapidapi.com',
			'X-RapidAPI-Key': 'bc864ba75dmsh17d4908165347bap1a2a98jsnf1350501706b'
		}
	};

	var searchURL
	var ingredient
	var recipeData = []
	var recipeList = []
	var ingredientData = []
	var imageList = []
	var ingredientsChosen = []
	var recipeURL = []
	var savedRecipes = []

	/****** RANDOM (FOOD) QUOTES API ******/
	fetch('https://famous-quotes4.p.rapidapi.com/random?category=food&count=50', {
		method: 'GET',
		headers: {
			'X-RapidAPI-Host': 'famous-quotes4.p.rapidapi.com',
			'X-RapidAPI-Key': 'bc864ba75dmsh17d4908165347bap1a2a98jsnf1350501706b'
		}
	})
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			//console.log(data);

			var quoteText = document.getElementById('quote-text');
			var quoteAuthor = document.getElementById('quote-author');

			/****** SHOWING RANDOM QUOTE ON PAGE LOAD ******/
			for (var i = 0; i < data.length; i++) {
					quoteText.textContent = data[i].text;
					quoteAuthor.textContent = data[i].author;
			}

			/****** CYCLING THROUGH TO SHOW 1 OF THE 50 PULLED QUOTES EVERY 2 MINUTES ******/
			function timedLoop() {
				var i = 0;
				var a = data[i].text;

				setTimeout(function () {
					quoteText.textContent = data[i].text;
					quoteAuthor.textContent = data[i].author;
					i++;
					if (i < a.length) {
						timedLoop();
					}
				}, 120000)
			}
			timedLoop();

		});

	$("#add-button").click(add)
	// Initializing a function that takes the user inputs and add them to an array of ingredients to be searched
	function add(event) {
		event.preventDefault()
		ingredient = $(".input").val()
		// simply replacing the space in the search with %2C%20 to be placed into the URL
		ingredient = ingredient.replace(" ", "%2C%20")
		// makes sure there is no repeating ingredient in the search
		if (ingredientsChosen.includes(ingredient) == false) {
			ingredientsChosen.push(ingredient);
			ingredientList();
		/****** THIS DOES NOT WORK YET ******/
		//} else if (ingredient == "") {
		//	ingredientsChosen.remove(ingredient);
		//	$("#modal-no-ingredients").css("display", "inline");
		}
	}

	// Initializing the search button
	$("#search-button").click(search)

	// Initializing search function that retrieves ingredient data and fetches the recipe API
	function search(event) {
		event.preventDefault()
		// makes the chosen ingredients div disappear
		$("#chosen-ingredients").css("display", "none")
		$("#given-recipes").css("display", "block")
		// clears the recipe section of any existing recipes
		$("#recipes-list").children().remove()
		searchURL = "https://yummly2.p.rapidapi.com/feeds/search?start=0&maxResult=18&q=" + ingredientsChosen
		fetch(searchURL, options)
			.then(function (response) {
				return response.json()
			})
			.then(function (data) {
				// stores the WHOLE data of every recipe
				recipeData = data.feed
				// stores ONLY the recipe names into an array
				recipeList = []
				for (var i = 0; i < recipeData.length; i++) {
					recipeList.push(recipeData[i].content.details.name)
				}
				// stores the WHOLE data of every ingredient in each recipe
				ingredientData = []
				for (var i = 0; i < recipeData.length; i++) {
					ingredientData.push(recipeData[i].content.ingredientLines)
				}
				// stores a link to an image that represents the finished dish for each recipe
				imageList = []
				for (var i = 0; i < recipeData.length; i++) {
					imageList.push(recipeData[i].content.details.images[0].hostedLargeUrl)
				}
				recipeURL = []
				for (var i = 0; i < recipeData.length; i++) {
					recipeURL.push(recipeData[i].content.details.directionsUrl)
				}
			})
			.then(populateRecipeList)
			.catch(err => console.error(err))
	}

	/****** ADDING INGREDIENTS TO "YOUR INGREDIENTS CHOSEN" ******/
	function ingredientList() {
		var ingredientsUl = document.getElementById('ingredients-list');
		var ingredientLi = document.createElement('li');
		var removeButton = document.createElement('button');
		removeButton.textContent = '✖';
		ingredientLi.innerHTML = $(".input").val()

		for (var i = 0; i < ingredientsChosen.length; i++) {
			ingredientsUl.appendChild(ingredientLi);
			ingredientLi.appendChild(removeButton);
			removeButton.setAttribute("id", "remove-button")
		}
	};

	// initializing a function to remove an ingredient from the ingredient list element and the ingredientChosen array
	// also setting an event listener to the remove buttons
	$("#ingredients-list").on("click", "#remove-button", function (event) {
		var target = event.target
		var removeThis = target.parentElement.textContent
		removeThis = removeThis.replace("✖", "")
		removeThis = removeThis.replace(" ", "%2C%20")
		var index = ingredientsChosen.indexOf(removeThis)
		if (index > -1) {
			ingredientsChosen.splice(index, 1);
		}
		target.parentElement.remove()
	})

	function populateRecipeList() {
		if ($("#given-recipes").attr("style") == "display: block;") {
			$("#recipes-list").children().remove()
			if (recipeList == "") {
				$("#modal-no-recipes").css("display", "inline")
			} else {
				for (var i = 0; i < recipeList.length; i++) {
					$("#recipes-list").append($("<li id = " + i + "><p>" + recipeList[i] + "</p><img src = " + imageList[i] + "><button class= \"fav-button\">Add to saved</button></li>"))
				}
			}
			savedRecipes = [JSON.parse(localStorage.getItem("Saved"))][0]
			var thisThing
			var index
			for (var i = 0; i < savedRecipes.length; i++) {
				thisThing = savedRecipes[i].name
				if (recipeList.includes(thisThing)) {
					index = recipeList.indexOf(thisThing)
					$("#recipes-list").children("#" + index).children("button").text("Saved")
					$("#recipes-list").children("#" + index).children("button").attr("class", "recipeSaved-button")
				}
			}
		}
	}

	$("#recipes-list").on("click", "p", getIngredient)
	$("#recipes-list").on("click", "img", getIngredient)
	function getIngredient(event) {
		var target = event.target
		var index = target.parentElement.id
		var recipeIngredients = []
		var ingredientArray = ingredientData[index]
		for (var i = 0; i < ingredientArray.length; i++) {
			recipeIngredients.push(ingredientArray[i].wholeLine)
		}
		for (var i = 0; i < recipeIngredients.length; i++) {
			$("#recipe-ingredients-list").append($("<li>" + recipeIngredients[i] + "</li>"))
		}
		$("#modal-recipe-ingredients").children(".our-modal").prepend($("<h3>" + recipeList[index] + "</h3>"))
		$("#modal-recipe-ingredients").children(".our-modal").children("div").prepend($("<a href =" + recipeURL[index] + " target='_blank'><button id=\"modal-recipe-ingredients-directions-button\" class=\"button\">Directions</button></a>"))
		$("#modal-recipe-ingredients").css("display", "inline")
	}
	$("#modal-recipe-ingredients-back-button").click(function() {
		$("#modal-recipe-ingredients").css("display", "none")
		$("#modal-recipe-ingredients").children(".our-modal").children("div").children(":first").remove()
		$("#modal-recipe-ingredients").children(".our-modal").children("h3").remove()
		$("#recipe-ingredients-list").children("li").remove()
	})

	// DISPLAYING ADDED INGREDIENTS WHEN BUTTON IS PRESSED
	$("#add-button").click(function () {
		$('#quotes').css('display', 'none'); /****** HIDING QUOTES DIV WHEN INGREDIENTS DIV SHOWS ******/
		$("#chosen-ingredients").css("display", "block")
	})

	// Remove recipe list when GO BACK button is pressed
	$("#given-back-button").click(function () {
		$("#given-recipes").css("display", "none")
		$("#chosen-ingredients").css("display", "block")
	})

	// Remove recipe list when ADD button is pressed
	$("#add-button").click(function () {
		$("#given-recipes").css("display", "none")
	})

	// Remove saved recipes modal when GO BACK button is pressed
	$("#saved-back-button").click(function () {
		$("#saved-recipes-modal").css("display", "none")
		populateRecipeList()
	})

	// Remove no ingredients modal when GO BACK button is pressed
	$("#modal-ingredients-back-button").click(function () {
		$("#modal-no-ingredients").css("display", "none")
	})

	// Remove no recipes modal when GO BACK button is pressed
	$("#modal-recipes-back-button").click(function () {
		$("#modal-no-recipes").css("display", "none")
	})

	/****** CLICKING OUTSIDE MODAL TO GET OUT OF MODAL - SAVED RECIPES MODAL ******/
	$('div#saved-recipes-modal').click(function () { $(this).hide() });
	$('div#saved-recipes').click(function (e) {
		e.stopPropagation();
	});

	/****** CLICKING OUTSIDE MODAL TO GET OUT OF MODAL - NO INGREDIENTS MODAL ******/
	$('div#modal-no-ingredients').click(function () { $(this).hide() });
	$('div#no-ingredients').click(function (e) {
		e.stopPropagation();
	});

	/****** CLICKING OUTSIDE MODAL TO GET OUT OF MODAL - NO RECIPES MODAL ******/
	$('div#modal-no-recipes').click(function () { $(this).hide() });
	$('div#no-recipes').click(function (e) {
		e.stopPropagation();
	});

	// Initializing function to retrieve relevant data to save a recipe to localStorage
	$("#recipes-list").on("click", ".fav-button", save)
	function save(event) {
		savedRecipes = [JSON.parse(localStorage.getItem("Saved"))][0]
		var target = event.target
		var recipeName = $(target).siblings(":first")[0].innerText
		var index = recipeList.indexOf(recipeName)
		if (savedRecipes == null || savedRecipes == undefined || savedRecipes == "") {
			savedRecipes = [{name: recipeList[index], link: recipeURL[index], image: imageList[index]}]
		} else {
			savedRecipes.unshift({name: recipeList[index], link: recipeURL[index], image: imageList[index]})
		}
		localStorage.setItem("Saved", JSON.stringify(savedRecipes))
		target.textContent = "Saved"
		target.setAttribute("class", "recipeSaved-button")
	}

	$("#recipes-list").on("click", ".recipeSaved-button", removeSaved2)
	function removeSaved2(event) {
		var target = event.target
		var removeThis = $(target).siblings("p")[0].innerText
		var thisThing
		var index
		for (var i = 0; i < savedRecipes.length; i++) {
			thisThing = savedRecipes[i].name
			if (thisThing == removeThis) {
				index = i
				savedRecipes.splice(index, 1)
			}
		}
		localStorage.setItem("Saved", JSON.stringify(savedRecipes))
		$("#saved-recipes-list").children().remove()
		if (savedRecipes == null || savedRecipes == undefined || savedRecipes == "") {
			savedRecipes = []
			localStorage.setItem("Saved", JSON.stringify(savedRecipes))
			$("#saved-recipes-list").append($("<span id=\"nothing-saved-text\">You have nothing saved yet</span>"))
		} else {
			for (var i = 0; i <savedRecipes.length; i++) {
				$("#saved-recipes-list").append($("<li id = " + i + "><a href=" + savedRecipes[i].link + " target='_blank'><p>" + savedRecipes[i].name + "</p><img src = " + savedRecipes[i].image + "></a><button class= \"removeSaved-button\">Remove</button></li>"))
			}
		}
		target.textContent = "Add to saved"
		target.setAttribute("class", "fav-button")
	}

	// Initializing function to retrieve localStorage and put it into the saved recipes div
	$("#saved-button").click(getSaved)
	function getSaved(event) {
		event.preventDefault()
		savedRecipes = [JSON.parse(localStorage.getItem("Saved"))][0]
		$("#saved-recipes-modal").css("display", "inline")
		$("#saved-recipes-list").children().remove()
		if (savedRecipes == null || savedRecipes == undefined || savedRecipes == "") {
			$("#saved-recipes-list").append($("<span id=\"nothing-saved-text\">You have nothing saved yet</span>"))
		} else {
			for (var i = 0; i <savedRecipes.length; i++) {
				$("#saved-recipes-list").append($("<li id = " + i + "><a href=" + savedRecipes[i].link + " target='_blank'><p>" + savedRecipes[i].name + "</p><img src = " + savedRecipes[i].image + "></a><button class= \"removeSaved-button\">Remove</button></li>"))
			}
		}
	}

	$("#saved-recipes-list").on("click", ".removeSaved-button", removeSaved)
	function removeSaved(event) {
		var target = event.target
		var index = target.parentElement.id
		savedRecipes.splice(index, 1)
		localStorage.setItem("Saved", JSON.stringify(savedRecipes))
		$("#saved-recipes-list").children().remove()
		if (savedRecipes == null || savedRecipes == undefined || savedRecipes == "") {
			savedRecipes = []
			localStorage.setItem("Saved", JSON.stringify(savedRecipes))
			$("#saved-recipes-list").append($("<span id=\"nothing-saved-text\">You have nothing saved yet</span>"))
		} else {
			for (var i = 0; i <savedRecipes.length; i++) {
				$("#saved-recipes-list").append($("<li id = " + i + "><a href=" + savedRecipes[i].link + " target='_blank'><p>" + savedRecipes[i].name + "</p><img src = " + savedRecipes[i].image + "></a><button class= \"removeSaved-button\">Remove</button></li>"))
			}
		}
	}

	$("#saved-recipes").on("click", "#clear-all-button", clearSaved)
	function clearSaved(event) {
		savedRecipes = []
		localStorage.setItem("Saved", JSON.stringify(savedRecipes))
		$("#saved-recipes-list").children().remove()
		$("#saved-recipes-list").append($("<span id=\"nothing-saved-text\">You have nothing saved yet</span>"))
	}
}); //CODE ABOVE THIS LINE