// waits for the DOM to load before continuing
$("document").ready(function () {
	// Recipe API key
	const options = {
		method: 'GET',
		headers: {
			'X-RapidAPI-Host': 'yummly2.p.rapidapi.com',
			'X-RapidAPI-Key': 'bc864ba75dmsh17d4908165347bap1a2a98jsnf1350501706b'
		}
	};

	// Initializing some main variables that will be used throughout the script
	var searchURL
	var ingredient
	var recipeData = []
	var recipeList = []
	var ingredientData = []
	var imageList = []
	var ingredientsChosen = []
	var recipeURL = []
	var savedRecipes = []

	// Initializing a function that takes the user inputs and add them to an array of ingredients to be searched. Also attaching a button that calls this function
	$("#add-button").click(add)
	function add(event) {
		event.preventDefault()
		ingredient = $(".input").val()
		// simply replacing the space in the search with %2C%20 so that it can be used in the search function below
		ingredient = ingredient.replace(" ", "%2C%20")
		// makes sure that the user actually inputted something
		if (ingredient == "" || ingredient == null || ingredient == undefined || ingredient == "%2C%20") {
			$("#modal-no-ingredients").css("display", "block");
		}
		// makes sure there is no repeating ingredient in the search
		if (ingredientsChosen.includes(ingredient) == false && ingredient !== "" && ingredient !== "%2C%20") {
			ingredientsChosen.push(ingredient);
			ingredientList();
			$('#quotes').css('display', 'none'); /****** HIDING QUOTES DIV WHEN INGREDIENTS DIV SHOWS ******/
			$("#chosen-ingredients").css("display", "block")
			$("#given-recipes").css("display", "none")
		}
	}

	/****** ADDING INGREDIENTS TO "YOUR INGREDIENTS CHOSEN" ******/
	// also creates list elements as well as a button element in the HTML
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
	// also delegates the function to the remove buttons
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
	
	// Initializing search function that takes the user input and fetches the recipe API. Also attaching a button that would call this function
	$("#search-button").click(search)
	function search(event) {
		event.preventDefault()
		// makes the chosen ingredients div disappear and the recipes div appear
		$("#chosen-ingredients").css("display", "none")
		$("#given-recipes").css("display", "block")
		// clears the recipe div so that it may be repopulated
		$("#recipes-list").children().remove()
		// the fetch function that would gather all the recipe data we need and store them to respective variables
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
				// stores the links to images that represents the finished dish for each recipe
				imageList = []
				for (var i = 0; i < recipeData.length; i++) {
					imageList.push(recipeData[i].content.details.images[0].hostedLargeUrl)
				}
				// stores the links to the full recipes
				recipeURL = []
				for (var i = 0; i < recipeData.length; i++) {
					recipeURL.push(recipeData[i].content.details.directionsUrl)
				}
			})
			// after all the variables are defined by the fetch function, calls a function to populate the recipe div
			.then(populateRecipeList)
			.catch(err => console.error(err))
	}

	// This function populates the recipes div
	function populateRecipeList() {
		// first checks that the recipe div is showing
		if ($("#given-recipes").attr("style") == "display: block;") {
			// clears the recipes div so that it may be populated
			$("#recipes-list").children().remove()
			// if there are no recipes found, pull up a modal that informs the user
			if (recipeList == "") {
				$("#modal-no-recipes").css("display", "inline")
			} else {
				// otherwise populate the div with the list of recipes; including the name, image, and a button that allows the user to save that recipe
				for (var i = 0; i < recipeList.length; i++) {
					$("#recipes-list").append($("<li id = " + i + "><p>" + recipeList[i] + "</p><img src = " + imageList[i] + "><button class= \"fav-button\">Add to saved</button></li>"))
				}
			}
			// logic to check that the recipes shown aren't already saved. if they are, change the attached button so the user is aware
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

	// function that retrieves the ingredient list of a specific recipe
	// also delegates the function to the proper DOM elements
	$("#recipes-list").on("click", "p", getIngredient)
	$("#recipes-list").on("click", "img", getIngredient)
	function getIngredient(event) {
		var target = event.target
		var index = target.parentElement.id
		$("#recipe-ingredients-list").append($("<li>Time to cook: " + recipeData[index].content.details.totalTime + "</li>"))
		var recipeIngredients = []
		var ingredientArray = ingredientData[index]
		for (var i = 0; i < ingredientArray.length; i++) {
			recipeIngredients.push(ingredientArray[i].ingredient)
		}
		for (var i = 0; i < recipeIngredients.length; i++) {
			$("#recipe-ingredients-list").append($("<li>" + recipeIngredients[i] + "</li>"))
		}
		// after retrieving the specific data, populate the modal that will show it
		$("#modal-recipe-ingredients").children(".our-modal").prepend($("<h3>" + recipeList[index] + "</h3>"))
		$("#modal-recipe-ingredients").children(".our-modal").children("div").prepend($("<a href =" + recipeURL[index] + " target='_blank'><button id=\"modal-recipe-ingredients-directions-button\" class=\"button\">Go to recipe</button></a>"))
		$("#modal-recipe-ingredients").css("display", "inline")
	}

	// makes the ingredients list modal initalized above disappear when instructed to
	$("#modal-recipe-ingredients-back-button").click(function () {
		$("#modal-recipe-ingredients").css("display", "none")
		$("#modal-recipe-ingredients").children(".our-modal").children("div").children(":first").remove()
		$("#modal-recipe-ingredients").children(".our-modal").children("h3").remove()
		$("#recipe-ingredients-list").children("li").remove()
	})

	/****** HOME BUTTON ******/
	$("#home-button").click(function () {
		$("#given-recipes").css("display", "none");
		$("#chosen-ingredients").css("display", "none");
		$("#quotes").css("display", "block")
		ingredientsChosen = []
		$("#ingredients-list").children().remove()
	})

	/****** ABOUT BUTTON SHOWS MODAL *******/
	$("#about-button").click(function () {
		$("#modal-about").css("display", "inline")
	});

	/****** ABOUT GO BACK BUTTON HIDES MODAL *******/
	$("#about-back-button").click(function () {
		$("#modal-about").css("display", "none")
	});

	// Remove recipe list when GO BACK button is pressed
	$("#given-back-button").click(function () {
		$("#given-recipes").css("display", "none")
		$("#chosen-ingredients").css("display", "block")
	})

	// Remove saved recipes modal when GO BACK button is pressed
	$("#saved-back-button").click(function () {
		$("#modal-saved-recipes").css("display", "none")
		populateRecipeList()
	})

	// Remove no ingredients modal when GO BACK button is pressed
	$("#modal-ingredients-back-button").click(function () {
		$("#modal-no-ingredients").css("display", "none")
	})

	// Remove no recipes modal when GO BACK button is pressed
	$("#modal-recipes-back-button").click(function () {
		$("#modal-no-recipes").css("display", "none")
		$("#given-recipes").css("display", "none")
		$("#chosen-ingredients").css("display", "block")
	})

	/****** CLICKING OUTSIDE MODAL TO GET OUT OF MODAL - ABOUT MODAL ******/
	$('div#modal-about').click(function () { $(this).hide() });
	$('div#about').click(function (e) {
		e.stopPropagation();
	});
	
	/****** CLICKING OUTSIDE MODAL TO GET OUT OF MODAL - RECIPE PREVIEW MODAL ******/
	$('div#modal-recipe-ingredients').click(function () {
		$(this).hide()
		$("#modal-recipe-ingredients").children(".our-modal").children("div").children(":first").remove()
		$("#modal-recipe-ingredients").children(".our-modal").children("h3").remove()
		$("#recipe-ingredients-list").children("li").remove()
	});
	$('div#recipe-ingredients').click(function (e) {
		e.stopPropagation();
	});

	/****** CLICKING OUTSIDE MODAL TO GET OUT OF MODAL - SAVED RECIPES MODAL ******/
	$('div#modal-saved-recipes').click(function () { $(this).hide() });
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

	// Initializing function tha retrieves relevant data to save a recipe to localStorage
	// delegates it to a button
	$("#recipes-list").on("click", ".fav-button", save)
	function save(event) {
		savedRecipes = [JSON.parse(localStorage.getItem("Saved"))][0]
		var target = event.target
		var recipeName = $(target).siblings(":first")[0].innerText
		var index = recipeList.indexOf(recipeName)
		if (savedRecipes == null || savedRecipes == undefined || savedRecipes == "") {
			savedRecipes = [{ name: recipeList[index], link: recipeURL[index], image: imageList[index] }]
		} else {
			savedRecipes.unshift({ name: recipeList[index], link: recipeURL[index], image: imageList[index] })
		}
		localStorage.setItem("Saved", JSON.stringify(savedRecipes))
		target.textContent = "Saved"
		target.setAttribute("class", "recipeSaved-button")
	}

	// Initializing function to retrieve localStorage and put it into the saved recipes div
	$("#saved-button").click(getSaved)
	function getSaved(event) {
		event.preventDefault()
		savedRecipes = [JSON.parse(localStorage.getItem("Saved"))][0]
		$("#modal-saved-recipes").css("display", "inline")
		$("#saved-recipes-list").children().remove()
		// logic that lets the user know if there aren't any saved recipes
		if (savedRecipes == null || savedRecipes == undefined || savedRecipes == "") {
			$("#saved-recipes-list").append($("<span id=\"nothing-saved-text\">You have nothing saved yet</span>"))
		} else {
			for (var i = 0; i < savedRecipes.length; i++) {
				$("#saved-recipes-list").append($("<li id = " + i + "><a href=" + savedRecipes[i].link + " target='_blank'><p>" + savedRecipes[i].name + "</p><img src = " + savedRecipes[i].image + "></a><button class= \"removeSaved-button\">Remove</button></li>"))
			}
		}
	}

	// this function removes a saved recipe from local storage and on the HTML
	$("#saved-recipes-list").on("click", ".removeSaved-button", removeSaved)
	function removeSaved(event) {
		var target = event.target
		var index = target.parentElement.id
		savedRecipes.splice(index, 1)
		localStorage.setItem("Saved", JSON.stringify(savedRecipes))
		$("#saved-recipes-list").children().remove()
		// same logic that lets the user know if there aren't any saved recipes
		if (savedRecipes == null || savedRecipes == undefined || savedRecipes == "") {
			savedRecipes = []
			localStorage.setItem("Saved", JSON.stringify(savedRecipes))
			$("#saved-recipes-list").append($("<span id=\"nothing-saved-text\">You have nothing saved yet</span>"))
		} else {
			for (var i = 0; i < savedRecipes.length; i++) {
				$("#saved-recipes-list").append($("<li id = " + i + "><a href=" + savedRecipes[i].link + " target='_blank'><p>" + savedRecipes[i].name + "</p><img src = " + savedRecipes[i].image + "></a><button class= \"removeSaved-button\">Remove</button></li>"))
			}
		}
	}

	// a modifaction of the removeSaved function with added logic find which saved recipe to remove
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
			for (var i = 0; i < savedRecipes.length; i++) {
				$("#saved-recipes-list").append($("<li id = " + i + "><a href=" + savedRecipes[i].link + " target='_blank'><p>" + savedRecipes[i].name + "</p><img src = " + savedRecipes[i].image + "></a><button class= \"removeSaved-button\">Remove</button></li>"))
			}
		}
		target.textContent = "Add to saved"
		target.setAttribute("class", "fav-button")
	}

	// function that clears ALL saved recipes
	$("#saved-recipes").on("click", "#clear-all-button", clearSaved)
	function clearSaved(event) {
		savedRecipes = []
		localStorage.setItem("Saved", JSON.stringify(savedRecipes))
		$("#saved-recipes-list").children().remove()
		$("#saved-recipes-list").append($("<span id=\"nothing-saved-text\">You have nothing saved yet</span>"))
	}

	/****** RANDOM (FOOD) QUOTES API ******/
	fetch('https://famous-quotes4.p.rapidapi.com/random?category=food&count=60', {
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
			var quoteText = document.getElementById('quote-text');
			var quoteAuthor = document.getElementById('quote-author');

			/****** SHOWING RANDOM QUOTE ON PAGE LOAD ******/
			for (var i = 0; i < data.length; i++) {
			quoteText.textContent = data[i].text;
			quoteAuthor.textContent = data[i].author;
			}

			/****** CYCLING THROUGH TO SHOW 1 OF THE 50 PULLED QUOTES EVERY 1 MINUTE ******/
			var headings = data;
			var i = 0;
			var intervalId = setInterval(function () {
				quoteText.textContent = headings[i].text;
				quoteAuthor.textContent = headings[i].author;
				if (i == (headings.length - 1)) {
					i = 0;
				} else {
					i++;
				}
			}, 60000)
		});
}); //CODE ABOVE THIS LINE