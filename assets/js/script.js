$("document").ready(function() {
	// API key
	const options = {
		method: 'GET',
		headers: {
			'X-RapidAPI-Host': 'yummly2.p.rapidapi.com',
			'X-RapidAPI-Key': '67eb59ab29msh40e600ec911fcb1p1f829fjsn39cb0c4650f1'
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
	// retrieves saved recipes from localStorage on load
	if (JSON.parse(localStorage.getItem("Saved")) === null) {
	} else {
		savedRecipes = [JSON.parse(localStorage.getItem("Saved"))]
	}

		// RANDOM FOOD QUOTES
		fetch('https://famous-quotes4.p.rapidapi.com/random?category=food&count=1', {
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
			console.log(data);
			console.log(data[0].text);
			console.log(data[0].author);

			var quoteText = document.getElementById('quote-text');
			var quoteAuthor = document.getElementById('quote-author');

			quoteText.textContent = data[0].text;
			quoteAuthor.textContent = data[0].author;
		});
	
		// INPUTTING RANDOM FOOD QUOTES
		/*function inputFoodQuotes() {
			var quoteText = getElementById('quote-text');
			var quoteAuthor = getElementById('quote-author');

			quoteText.textContent(data[0].text);
			quoteAuthor.textContent(data[0].author);
		}*/

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
			ingredientList()
		}
	}
	
	// Initializing the search button
	$("#search-button").click(search)

	// Initializing search function that retrieves ingredient data and fetches the recipe API
	function search(event) {
		event.preventDefault()
		// makes the chosen ingredients div disappear
		$("#chosen-ingredients").css("display", "none")
		// clears the recipe section of any existing recipes
		$("#recipes-list").children().remove()
		searchURL = "https://yummly2.p.rapidapi.com/feeds/search?start=0&maxResult=18&q=" + ingredientsChosen
		console.log(searchURL)
		fetch(searchURL, options)
			.then(function(response) {
				return response.json()
			})
			.then(function(data) {
				// stores the WHOLE data of every recipe
				recipeData = data.feed
				console.log(recipeData)
				// stores ONLY the recipe names into an array
				recipeList = []
				for (var i = 0; i < recipeData.length; i++) {
					recipeList.push(recipeData[i].content.details.name)
				}
				console.log(recipeList)
				// stores the WHOLE data of every ingredient in each recipe
				ingredientData = []
				for (var i = 0; i < recipeData.length; i++) {
					ingredientData.push(recipeData[i].content.ingredientLines)
				}
				console.log(ingredientData)
				// stores a link to an image that represents the finished dish for each recipe
				imageList = []
				for (var i = 0; i < recipeData.length; i++) {
					imageList.push(recipeData[i].content.details.images[0].hostedLargeUrl)
				}
				console.log(imageList)
				recipeURL = []
				for (var i = 0; i < recipeData.length; i++) {
					recipeURL.push(recipeData[i].content.details.directionsUrl)
				}
			})
			.then(populateRecipeList)
			.catch(err => console.error(err))
			$("#given-recipes").css("display", "block")
	}

	// ADDING INGREDIENTS TO "YOUR INGREDIENTS CHOSEN"
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

	$("#ingredients-list").on("click", "#remove-button", function(event) {
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
		for (var i = 0; i < recipeList.length; i++) {
			$("#recipes-list").append($("<li><a href=" + recipeURL[i] + " target='_blank'><p>" + recipeList[i] + "</p><img src = " + imageList[i] + "></a><button class= \"fav-button\">Add to saved</button></li>"))
		}
	}

	// DISPLAYING ADDED INGREDIENTS WHEN BUTTON IS PRESSED
	$("#add-button").click(function() {
		$("#chosen-ingredients").css("display", "block")
	})

	// Remove recipe list when GO BACK button is pressed
	$("#given-back-button").click(function() {
		$("#given-recipes").css("display", "none")
		$("#chosen-ingredients").css("display", "block")
	})

	// Remove recipe list when ADD button is pressed
	$("#add-button").click(function() {
		$("#given-recipes").css("display", "none")
	})

	// Remove saved recipes modal when GO BACK button is pressed
	$("#saved-back-button").click(function() {
		$("#saved-recipes-modal").css("display", "none")
	})

	// Remove no ingredients modal when GO BACK button is pressed
	$("#modal-ingradients-back-button").click(function() {
		$("#modal-no-ingredients").css("display", "none")
	})

	// Remove no recipes modal when GO BACK button is pressed
	$("#modal-recipes-back-button").click(function() {
		$("#modal-no-recipes").css("display", "none")
	})

	// Initializing function to retrieve relevant data to save a recipe to localStorage
	$("#recipes-list").on("click", ".fav-button", save)
	function save(event) {
		var target = event.target
		var recipeName = $(target).siblings().children(":first")[0].innerText
		var index = recipeList.indexOf(recipeName)
		savedRecipes.unshift({name: recipeList[index], link: recipeURL[index], image: imageList[index]})
		localStorage.setItem("Saved", JSON.stringify(savedRecipes))
	}

	// Initializing function to retrieve localStorage and put it into the saved recipes div
	$("#saved-button").click(getSaved)
	function getSaved(event) {
		event.preventDefault()
		console.log("yo")
		savedRecipes = [JSON.parse(localStorage.getItem("Saved"))]
		console.log(savedRecipes)
		$("#saved-recipes-modal").css("display", "inline")
		if (savedRecipes[0] == null || savedRecipes[0] == undefined) {
			$("#saved-recipes-list").append($("<span id=\"nothing-saved-text\">You have nothing saved yet</span>"))
		} else {
			for (var i = 0; i <savedRecipes[0].length; i++) {
				$("#saved-recipes-list").append($("<li><a href=" + savedRecipes[0][i].link + " target='_blank'><p>" + savedRecipes[0][i].name + "</p><img src = " + savedRecipes[0][i].image + "></a></li>"))
			}
		}
	}
}); //CODE ABOVE THIS LINE