package main

import (
	"crypto/md5"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gocolly/colly"
	"github.com/google/uuid"

	"github.com/joho/godotenv"

	"logit/utils"
)

var (
	baseAuthorizeUrl = "https://www.fitbit.com/oauth2/authorize"
	fitbitApiUrl     = "https://api.fitbit.com"
	scopes           = []string{
		"profile",
		"nutrition",
	}
	expiry = 604800
)

var sessionStore = map[string]utils.AuthResponse{}
var uagents = []string{}

func init() {
	// load uagents
	utils.LoadUagents(&uagents)

	// load environment variables
	godotenv.Load()

	// check debug
	debug, _ := strconv.ParseBool(os.Getenv("DEBUG"))

	// disable console color
	if !debug {
		gin.DisableConsoleColor()
		gin.SetMode(gin.ReleaseMode)

		// create a log file
		f, _ := os.Create("gin.log")

		// Essentially, makes gin route all console output
		// to a file
		gin.DefaultWriter = io.MultiWriter(f, os.Stdout)
		log.SetOutput(gin.DefaultWriter)
	}
}

func main() {
	// initialize router
	r := gin.Default()
	r.Static("/static", "./static")
	r.LoadHTMLGlob("static/templates/*")

	frontendUrl := os.Getenv("FRONTEND_URL")
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{frontendUrl, "http://localhost"},
		AllowMethods:     []string{"*"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
	}))

	r.GET("/health", func(c *gin.Context) {
		c.String(200, "ok")
	})

	// gets an auth token from fitbit to make all subsequent requests
	r.GET("/auth", func(ctx *gin.Context) {
		// form the full authorization url
		authorizeUrlFormat := "%s?response_type=code&client_id=%s&redirect_uri=%s&scope=%s&expires_in=%d"
		encodedScopes := strings.Join(scopes, " ")
		authorizeUrl := fmt.Sprintf(authorizeUrlFormat,
			baseAuthorizeUrl, os.Getenv("CLIENT_ID"),
			url.QueryEscape(os.Getenv("REDIRECT_URL")),
			encodedScopes, expiry,
		)

		// return a redirect response
		ctx.Redirect(http.StatusTemporaryRedirect, authorizeUrl)
	})

	// callback gets access tokens and return
	r.GET("/auth_callback", func(ctx *gin.Context) {
		authToken := os.Getenv("TOKEN")

		// get the authorization code
		code := ctx.Query("code")

		// make an http client
		client := &http.Client{
			Timeout: time.Second * 10,
		}

		// construct request
		data := url.Values{}
		data.Set("clientId", os.Getenv("CLIENT_ID"))
		data.Set("grant_type", "authorization_code")
		data.Set("redirect_uri", os.Getenv("REDIRECT_URL"))
		data.Set("code", code)

		tokenEndpoint := fmt.Sprintf("%s/oauth2/token", fitbitApiUrl)
		req, _ := http.NewRequest(http.MethodPost, tokenEndpoint, strings.NewReader(data.Encode()))
		req.Header.Set("Authorization", fmt.Sprintf("Basic %s", authToken))
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

		// send request
		resp, err := client.Do(req)
		if err != nil {
			log.Printf("error: %+v", err)
			ctx.HTML(500, "error.html", gin.H{
				"title":       "Unsuccessful",
				"header":      "Oh no! Your login failed",
				"body":        "Unfortunately, your login request was unsuccessful. You will be redirected back to the app.",
				"redirectUrl": frontendUrl,
			})
		}

		// read response
		responseBody, _ := io.ReadAll(resp.Body)
		defer resp.Body.Close()

		var authConf utils.AuthResponse
		json.Unmarshal(responseBody, &authConf)

		// generate session id
		sessionId := md5.Sum([]byte(authConf.UserId))
		sessionIdStr := fmt.Sprintf("%x", sessionId)
		sessionStore[sessionIdStr] = authConf

		redirectUrl := fmt.Sprintf(
			"%s?sess=%s",
			frontendUrl,
			sessionIdStr,
		)

		// redirect
		ctx.HTML(200, "success.html", gin.H{
			"title":       "Success",
			"header":      "Congrats! You're all set",
			"body":        "Your login request was successful! You should be redirected back to the app shortly.",
			"redirectUrl": redirectUrl,
		})
	})

	// calculates nutrition
	r.GET("/calculate", func(ctx *gin.Context) {
		// spoof user agent
		uagent := utils.Spoof(uagents)
		fmt.Printf("user agent: %s", uagent)

		var rawRecipe *map[string]interface{}
		var recipeId string = ""

		// create a collector
		c := colly.NewCollector(
			colly.UserAgent(uagent),
		)
		c.Limit(&colly.LimitRule{
			RandomDelay: 1 * time.Second,
		})

		// when it makes the request
		c.OnRequest(func(r *colly.Request) {
			r.Headers.Set("Referer", "https://www.google.com")
			log.Printf("Visiting %s", r.URL)
		})

		// when it finishes scrapes
		c.OnScraped(func(r *colly.Response) {
			log.Printf("Finished scraping %s", r.Request.URL)
		})

		c.OnError(func(r *colly.Response, err error) {
			log.Printf("response: %s", r.Body)
			log.Printf("scraping error: %+v", err)
		})

		// grab the application/ld+json script data
		c.OnHTML("script[type='application/ld+json']", func(h *colly.HTMLElement) {
			// parse html into interface
			var ldJSON interface{}
			json.Unmarshal([]byte(h.Text), &ldJSON)

			// this if for logging purposes
			// in case something fails, I can always refer to the recipe
			// id and get a stack trace of what happened
			id := uuid.New().String()
			log.Printf("Created log for recipe %s\n", id)
			f, _ := os.Create(fmt.Sprintf("./logs/%s.json", id))
			f.Write([]byte(h.Text))
			f.Close()

			// use type switching in order to do logic based
			// on the type of the underlying interface
			switch json := ldJSON.(type) {
			case []map[string]interface{}:
				// it's a list of schemas
				// find the @type == recipe
				for _, schema := range json {
					if schemaType, exists := schema["@type"]; exists {
						switch schemaType := schemaType.(type) {
						case string:
							schemaType = strings.ToLower(schemaType)
							if schemaType == "recipe" {
								rawRecipe = &schema
								recipeId = id
							}
						case []interface{}:
							for _, val := range schemaType {
								if val, ok := val.(string); ok {
									val = strings.ToLower(val)
									if val == "recipe" {
										rawRecipe = &schema
										recipeId = id
									}
								}
							}
						default:
							log.Printf("error: encountered unexpected type %T", schemaType)
						}
					}
				}
			case []interface{}:
				// it's a list of schemas
				// find the @type == recipe
				for _, schema := range json {
					if schema, ok := schema.(map[string]interface{}); ok {
						if schemaType, exists := schema["@type"]; exists {
							switch schemaType := schemaType.(type) {
							case string:
								schemaType = strings.ToLower(schemaType)
								if schemaType == "recipe" {
									rawRecipe = &schema
									recipeId = id
								}
							case []interface{}:
								for _, val := range schemaType {
									if val, ok := val.(string); ok {
										val = strings.ToLower(val)
										if val == "recipe" {
											rawRecipe = &schema
											recipeId = id
										}
									}
								}
							default:
								log.Printf("error: encountered unexpected type %T", schemaType)
							}
						}
					}
				}
			case map[string]interface{}:
				// does @graph prop exist?
				if nodeArray, exists := json["@graph"]; exists {
					// is it a []interface{}
					if nodeArray, ok := nodeArray.([]interface{}); ok {
						// loop through it
						for _, schema := range nodeArray {
							// check if schema is map[string]interface{}
							if schema, ok := schema.(map[string]interface{}); ok {
								// check if @type prop exists
								if schemaType, exists := schema["@type"]; exists {
									switch schemaType := schemaType.(type) {
									case string:
										schemaType = strings.ToLower(schemaType)
										if schemaType == "recipe" {
											rawRecipe = &schema
											recipeId = id
										}
									case []interface{}:
										for _, val := range schemaType {
											if val, ok := val.(string); ok {
												val = strings.ToLower(val)
												if val == "recipe" {
													rawRecipe = &schema
													recipeId = id
												}
											}
										}
									default:
										log.Printf("error: encountered unexpected type %T", schemaType)
									}
								}
							}
						}
					}
				}

				// check if the json is actually the recipe structure
				if schemaType, exists := json["@type"]; exists {
					switch schemaType := schemaType.(type) {
					case string:
						schemaType = strings.ToLower(schemaType)
						if schemaType == "recipe" {
							rawRecipe = &json
							recipeId = id
						}
					case []interface{}:
						for _, val := range schemaType {
							if val, ok := val.(string); ok {
								val = strings.ToLower(val)
								if val == "recipe" {
									rawRecipe = &json
									recipeId = id
								}
							}
						}
					default:
						log.Printf("error: encountered unexpected type %T", schemaType)
					}
				}
			default:
				log.Printf("error: encountered unexpected type %T", json)
			}
		})

		link := ctx.Query("link")
		c.Visit(link)

		// marshal then remarshal into utils.Recipe
		var recipe utils.Recipe
		bytes, _ := json.Marshal(rawRecipe)
		json.Unmarshal(bytes, &recipe)

		// change nutrition data
		nutritionData := recipe.Nutrition
		if nutritionData, ok := nutritionData.(map[string]interface{}); ok {
			// delete the type identifier from schema.org
			delete(nutritionData, "@type")
			delete(nutritionData, "@context")

			// change the rest of the nutrition data into {"val": "", "unit": ""}
			for key, val := range nutritionData {
				// parse the quantity
				exp := regexp.MustCompile(`[0-9]+\.*[0-9]*`)

				if val == nil {
					delete(nutritionData, key)
				}

				// TODO: add better type checking for [val]
				if val, ok := val.(string); ok {
					match := exp.FindIndex([]byte(val))
					if len(match) == 2 {
						i, j := match[0], match[1]
						qty, err := strconv.ParseFloat(val[i:j], 64)
						if err != nil {
							log.Println("error: failed to parse nutrition quantity values")
							log.Printf("check recipe log: %s\n", recipeId)
						}
						unit, name := utils.GetUnit(key), utils.CreateName(key)

						// overrite the map
						nutritionData[key] = map[string]interface{}{
							"qty":  qty,
							"unit": unit,
							"name": name,
						}
					}
				}
			}
		}

		// change image data
		switch img := recipe.Image.(type) {
		case []interface{}:
			i := rand.Intn(len(img))
			switch imgObj := img[i].(type) {
			case map[string]interface{}:
				if link, exists := imgObj["url"]; exists {
					recipe.Image = link
				}
			case string:
				recipe.Image = imgObj
			default:
				log.Printf("url: encountered type %T", imgObj)
			}
		case map[string]interface{}:
			// grap url and set it
			if url, exists := img["url"]; exists {
				recipe.Image = url
			}
		default:
			log.Printf("img: encountered type %T", img)
		}

		// change main entity
		if entity, ok := recipe.MainEntity.(map[string]interface{}); ok {
			// grap url and set it
			if url, exists := entity["@id"]; exists {
				recipe.MainEntity = url
			}
		}

		ctx.JSON(http.StatusAccepted, recipe)
	})

	// ** REQUESTS REQUIRE AUTH **

	// adds food into log
	r.POST("/log", func(ctx *gin.Context) {
		// get the current session
		sess := ctx.Request.Header.Get("Authorization")

		// if no session is present, return a Unauthorized code
		if sess == "" {
			err := fmt.Errorf("not authorized to make this request")
			ctx.AbortWithError(http.StatusUnauthorized, err)
		}

		// read the auth config
		var authConf utils.AuthResponse = sessionStore[sess]

		// read the request body
		var body utils.FoodLogRequest
		if err := ctx.ShouldBindJSON(&body); err != nil {
			ctx.AbortWithError(500, err)
		}

		// ** make request to fitbit api **
		client := &http.Client{
			Timeout: time.Second * 10,
		}

		// construct query params
		// 304 -> 1 serving unit
		defaultMeasurementId := 304
		params := url.Values{}
		params.Set("foodName", body.Name)
		params.Set("mealTypeId", fmt.Sprintf("%d", body.Meal))
		params.Set("unitId", fmt.Sprintf("%d", defaultMeasurementId))
		params.Set("amount", utils.ConvertFloat(body.Amount, 2))
		params.Set("date", time.Now().Format("2006-01-02"))

		// Set nutrition information
		params.Set("calories", utils.ConvertFloat(body.Nutrition.Calories, 0))
		params.Set("totalFat", utils.ConvertFloat(body.Nutrition.Fat, 2))
		params.Set("transFat", utils.ConvertFloat(body.Nutrition.TransFat, 2))
		params.Set("saturatedFat", utils.ConvertFloat(body.Nutrition.SaturatedFat, 2))
		params.Set("cholesterol", utils.ConvertFloat(body.Nutrition.Cholesterol, 2))
		params.Set("sodium", utils.ConvertFloat(body.Nutrition.Sodium, 2))
		params.Set("totalCarbohydrate", utils.ConvertFloat(body.Nutrition.Carbohydrates, 2))
		params.Set("dietaryFiber", utils.ConvertFloat(body.Nutrition.Fiber, 2))
		params.Set("sugars", utils.ConvertFloat(body.Nutrition.Sugar, 2))
		params.Set("protein", utils.ConvertFloat(body.Nutrition.Protein, 2))

		logEndpoint := fmt.Sprintf(
			"%s/1/user/%s/foods/log.json",
			fitbitApiUrl,
			authConf.UserId,
		)

		// create request obj
		req, _ := http.NewRequest(http.MethodPost, logEndpoint, nil)
		req.URL.RawQuery = params.Encode()

		// set headers
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", authConf.AccessToken))
		req.Header.Set("Accept", "application/json")

		// send request
		resp, err := client.Do(req)
		if err != nil {
			ctx.AbortWithError(500, err)
		}

		if resp.StatusCode == http.StatusCreated {
			ctx.JSON(http.StatusCreated, `{"message": "success"}`)
		} else {
			responseBody, _ := io.ReadAll(resp.Body)
			defer resp.Body.Close()

			ctx.JSON(resp.StatusCode, string(responseBody))
		}
	})

	// creates a food
	r.POST("/create", func(ctx *gin.Context) {
		// get the current session
		sess := ctx.Request.Header.Get("Authorization")

		// if no session is present, return a Unauthorized code
		if sess == "" {
			err := fmt.Errorf("not authorized to make this request")
			ctx.JSON(http.StatusUnauthorized, fmt.Sprintf(`{"message":"%+v"`, err))
		}

		// read the auth config
		var authConf utils.AuthResponse = sessionStore[sess]

		// read the request body
		var body utils.FoodCreateRequest
		if err := ctx.ShouldBindJSON(&body); err != nil {
			err := fmt.Errorf("couldn't understand the request")
			ctx.JSON(http.StatusBadRequest, fmt.Sprintf(`{"message":"%+v"`, err))
		}

		// ** make request to fitbit api **
		client := &http.Client{
			Timeout: time.Second * 10,
		}

		// construct query params
		// 304 -> 1 serving unit
		params := url.Values{}
		params.Set("name", body.Name)
		params.Set("defaultFoodMeasurementUnitId", "304")
		params.Set("defaultServingSize", "1")
		params.Set("formType", "DRY")
		params.Set("description", body.Description)

		// Set nutrition information
		params.Set("calories", utils.ConvertFloat(body.Nutrition.Calories, 0))
		params.Set("totalFat", utils.ConvertFloat(body.Nutrition.Fat, 2))
		params.Set("transFat", utils.ConvertFloat(body.Nutrition.TransFat, 2))
		params.Set("saturatedFat", utils.ConvertFloat(body.Nutrition.SaturatedFat, 2))
		params.Set("cholesterol", utils.ConvertFloat(body.Nutrition.Cholesterol, 2))
		params.Set("sodium", utils.ConvertFloat(body.Nutrition.Sodium, 2))
		params.Set("totalCarbohydrate", utils.ConvertFloat(body.Nutrition.Carbohydrates, 2))
		params.Set("dietaryFiber", utils.ConvertFloat(body.Nutrition.Fiber, 2))
		params.Set("sugars", utils.ConvertFloat(body.Nutrition.Sugar, 2))
		params.Set("protein", utils.ConvertFloat(body.Nutrition.Protein, 2))

		logEndpoint := fmt.Sprintf(
			"%s/1/user/%s/foods.json",
			fitbitApiUrl,
			authConf.UserId,
		)

		// create request obj
		req, _ := http.NewRequest(http.MethodPost, logEndpoint, nil)
		req.URL.RawQuery = params.Encode()

		// set headers
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", authConf.AccessToken))
		req.Header.Set("Accept", "application/json")

		// send request
		resp, err := client.Do(req)
		if err != nil {
			err := fmt.Errorf("unable to fulfill request")
			ctx.JSON(http.StatusInternalServerError, fmt.Sprintf(`{"message":"%+v"`, err))
		}

		if resp.StatusCode == http.StatusCreated {
			ctx.JSON(http.StatusCreated, `{"message": "success"}`)
		} else {
			responseBody, _ := io.ReadAll(resp.Body)
			defer resp.Body.Close()

			ctx.JSON(resp.StatusCode, string(responseBody))
		}
	})

	// gets the current active user
	r.GET("/me", func(ctx *gin.Context) {
		sess := ctx.Request.Header.Get("Authorization")
		if authConf, exists := sessionStore[sess]; exists {
			client := http.Client{
				Timeout: time.Second * 10,
			}

			profileEndpoint := fmt.Sprintf("%s/1/user/%s/profile.json", fitbitApiUrl, authConf.UserId)
			req, _ := http.NewRequest(http.MethodGet, profileEndpoint, nil)
			req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", authConf.AccessToken))
			req.Header.Add("Content-Type", "application/json")

			// send request
			resp, err := client.Do(req)
			if err != nil {
				ctx.JSON(500, fmt.Sprintf(`{"message": %+v}`, err))
			}

			// read response
			responseBody, _ := io.ReadAll(resp.Body)
			defer resp.Body.Close()

			var user utils.User
			json.Unmarshal(responseBody, &user)

			var profile utils.UserProfile = user.Profile

			var response utils.UserResponse = utils.UserResponse{
				UserId:  authConf.UserId,
				Profile: profile,
			}

			ctx.JSON(200, response)
		} else {
			ctx.JSON(401, nil)
		}
	})

	r.GET("/logout", func(ctx *gin.Context) {
		authToken := os.Getenv("TOKEN")

		sess := ctx.Query("sess")
		if authConf, exists := sessionStore[sess]; exists {
			client := http.Client{
				Timeout: time.Second * 10,
			}

			// revoke access_token
			revokeEndpoint := fmt.Sprintf("%s/oauth2/revoke", fitbitApiUrl)
			params := url.Values{}
			params.Set("token", authConf.AccessToken)
			req, _ := http.NewRequest(http.MethodPost, revokeEndpoint, nil)
			req.Header.Set("Authorization", fmt.Sprintf("Basic %s", authToken))
			req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

			// send request
			_, err := client.Do(req)
			if err != nil {
				log.Printf("error: %+v", err)
				ctx.HTML(500, "error.html", gin.H{
					"title":       "Logout error",
					"header":      "Oh no! We coudn't log you out",
					"body":        "We were unable to fulfill your logout request. You can try again once you have been redirected to the app.",
					"redirectUrl": frontendUrl,
				})
			}

			// remove the session id from sessionStore
			delete(sessionStore, sess)
			ctx.HTML(200, "success.html", gin.H{
				"title":       "Logged out",
				"header":      "We'll miss you",
				"body":        "Your logout request was successful! You will be redirected shortly",
				"redirectUrl": frontendUrl,
			})
		} else {
			ctx.HTML(401, "error.html", gin.H{
				"title":       "Logout error",
				"header":      "Fishy...",
				"body":        "It doesn't seem that you were logged in. If this is a mistake, please don't hesitate to reach out.",
				"redirectUrl": frontendUrl,
			})
		}
	})

	// start the server
	port := fmt.Sprintf(":%s", os.Getenv("PORT"))
	r.Run(port)
}
