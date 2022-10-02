package utils

// relevant nutrition facts for user
type Nutrition struct {
	Calories      float64 `json:"calories"`
	Fat           float64 `json:"fatContent"`
	TransFat      float64 `json:"transFatContent"`
	SaturatedFat  float64 `json:"saturatedFatContent"`
	Cholesterol   float64 `json:"cholesterolContent"`
	Sodium        float64 `json:"sodiumContent"`
	Carbohydrates float64 `json:"carbohydratesContent"`
	Fiber         float64 `json:"fiberContent"`
	Sugar         float64 `json:"sugarContent"`
	Protein       float64 `json:"proteinContent"`
}

type MealType int

const (
	Breakfast MealType = iota + 1
	MorningSnack
	Lunch
	AfternoonSnack
	Dinner
	Anytime MealType = 7
)

// struct for accepting /log requests from app
type FoodLogRequest struct {
	Name      string    `json:"foodName"`
	Meal      MealType  `json:"mealTypeId"`
	UnitId    int       `json:"unitId"`
	Amount    float64   `json:"amount"`
	Nutrition Nutrition `json:"nutrition"`
}

// NOTE: calories must be a whole number
// struct for accepting /create requests
type FoodCreateRequest struct {
	Name        string    `json:"foodName"`
	UnitId      int       `json:"unitID"`
	ServingSize int       `json:"servingSize"`
	Calories    float64   `json:"calories"`
	Description string    `json:"description"`
	Nutrition   Nutrition `json:"nutrition"`
}

// ** RESPONSE STRUCTS **

// Auth response from api.fitbit.com
type AuthResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	RefreshToken string `json:"refresh_token"`
	UserId       string `json:"user_id"`
}

type User struct {
	Profile UserProfile `json:"user"`
}

type UserProfile struct {
	Avatar    string `json:"avatar"`
	Avatar150 string `json:"avatar150"`
	Avatar640 string `json:"avatar640"`
}

type UserResponse struct {
	UserId  string      `json:"user_id"`
	Profile UserProfile `json:"profile"`
}
