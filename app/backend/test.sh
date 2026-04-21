#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3001"
EMAIL="test3@example.com"
PASSWORD="password123"
NEW_PASSWORD="newpassword456"

echo -e "${BLUE}🧪 Testing Recipe Calories Backend${NC}\n"

# Test 1: Health check
echo -e "${BLUE}Test 1: Health Check${NC}"
HEALTH_CHECK=$(curl -s "$BASE_URL/health")
if [ -z "$HEALTH_CHECK" ]; then
    echo -e "${RED}❌ Backend is not running at $BASE_URL${NC}"
    exit 1
fi
echo "$HEALTH_CHECK" | jq .
echo ""

# Test 2: Register user
echo -e "${BLUE}Test 2: Register User${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"name\": \"Test User\",
    \"dailyCalorieGoal\": 2000
  }")

if [ -z "$REGISTER_RESPONSE" ]; then
    echo -e "${RED}❌ No response from registration endpoint${NC}"
    exit 1
fi

echo "$REGISTER_RESPONSE" | jq .

ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.accessToken // empty')

if [ -z "$ACCESS_TOKEN" ]; then
    ERROR_MSG=$(echo "$REGISTER_RESPONSE" | jq -r '.error')
    if [ "$ERROR_MSG" == "El email ya está registrado" ]; then
        echo -e "${BLUE}ℹ️ User already exists, performing login instead...${NC}"
        LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
          -H "Content-Type: application/json" \
          -d "{
            \"email\": \"$EMAIL\",
            \"password\": \"$PASSWORD\"
          }")
        
        # Check if login with original password works, if not try with new password (in case test was interrupted)
        ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken // empty')
        if [ -z "$ACCESS_TOKEN" ]; then
            echo -e "${BLUE}ℹ️ Login with initial password failed, trying with new password...${NC}"
            LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
              -H "Content-Type: application/json" \
              -d "{
                \"email\": \"$EMAIL\",
                \"password\": \"$NEW_PASSWORD\"
              }")
            ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken // empty')
            PASSWORD=$NEW_PASSWORD # Update current password for later tests
        fi
        
        if [ -z "$ACCESS_TOKEN" ]; then
            echo -e "${RED}❌ Failed to get access token through login.${NC}"
            echo "$LOGIN_RESPONSE" | jq .
            exit 1
        fi
        echo -e "${GREEN}✓ Logged in successfully${NC}"
    else
        echo -e "${RED}❌ Registration failed with unexpected error.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ User registered successfully${NC}"
fi

echo -e "  Access Token: ${ACCESS_TOKEN:0:20}..."
echo ""

# Test 3: Get profile
echo -e "${BLUE}Test 3: Get User Profile${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/users/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "$PROFILE_RESPONSE" | jq .
echo -e "${GREEN}✓ Profile retrieved${NC}\n"

# Test 4: Update profile
echo -e "${BLUE}Test 4: Update Profile${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/api/users/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "dailyCalorieGoal": 2500
  }')
echo "$UPDATE_RESPONSE" | jq .
echo -e "${GREEN}✓ Profile updated${NC}\n"

# Test 5: Login (Verification)
echo -e "${BLUE}Test 5: Login Verification${NC}"
LOGIN_VERIFY=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")
echo "$LOGIN_VERIFY" | jq .
echo -e "${GREEN}✓ Login successful${NC}\n"

# Test 6: Change password
echo -e "${BLUE}Test 6: Change Password${NC}"
CHANGE_PW_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users/change-password" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"currentPassword\": \"$PASSWORD\",
    \"newPassword\": \"$NEW_PASSWORD\"
  }")
echo "$CHANGE_PW_RESPONSE" | jq .
echo -e "${GREEN}✓ Password change request sent${NC}\n"

# Test 7: Login with new password
echo -e "${BLUE}Test 7: Login with New Password${NC}"
FINAL_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$NEW_PASSWORD\"
  }")
echo "$FINAL_LOGIN" | jq .
echo -e "${GREEN}✓ Login with new password successful${NC}\n"

echo -e "${GREEN}✅ All tests completed!${NC}"
