package utils

import (
	"bufio"
	"math/rand"
	"os"
	"strings"

	"golang.org/x/text/cases"
	"golang.org/x/text/language"
)

type Thing struct {
	Name        string      `json:"name"`
	Description string      `json:"description"`
	MainEntity  interface{} `json:"mainEntityOfPage"`
	Image       interface{} `json:"image"`
}

// schema.org/recipe
type Recipe struct {
	CookTime    string      `json:"cookTime"`
	PrepTime    string      `json:"prepTime"`
	TotalTime   string      `json:"totalTime"`
	Nutrition   interface{} `json:"nutrition"`
	Ingredients interface{} `json:"recipeIngredient"`
	Thing
}

func LoadUagents(uagents *[]string) error {
	//  open file
	f, err := os.Open("./utils/uagents.txt")
	if err != nil {
		return err
	}

	// create a buffer reader
	scanner := bufio.NewScanner(f)
	var n int = 10000
	for i := 0; i < n; i++ {
		if ok := scanner.Scan(); ok {
			*uagents = append(*uagents, scanner.Text())
		}
	}

	return nil
}

// Randomly pick a User-Agent from a
func Spoof(uagents []string) string {
	uagent := ""
	var n int = len(uagents)

	uagent = uagents[rand.Intn(n)]
	return uagent
}

func GetUnit(key string) string {
	if key == "calories" {
		return "cals"
	} else if key == "carbohydrateContent" ||
		key == "fatContent" || key == "fiberContent" ||
		key == "proteinContent" || key == "sugarContent" ||
		key == "transFatContent" || key == "unsaturatedFatContent" ||
		key == "saturatedFatContent" {
		return "g"
	} else {
		return "mg"
	}
}

func CreateName(key string) string {
	c := cases.Title(language.English)

	if key == "saturatedFatContent" {
		return "Saturated fat"
	} else if key == "transFatContent" {
		return "Trans fat"
	} else if key == "unsaturatedFatContent" {
		return "Unsaturated fat"
	} else if strings.HasSuffix(key, "Size") {
		return c.String(strings.Replace(key, "Size", "", 1))
	} else if strings.HasSuffix(key, "Content") {
		return c.String(strings.Replace(key, "Content", "", 1))
	} else {
		return c.String(key)
	}
}
