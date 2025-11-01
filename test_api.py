#!/usr/bin/env python3
"""
Test script to verify the Flatmate API is working
"""

import requests
import json

BASE_URL = "http://localhost:8000"

# Global variable to store the test email
test_email = None

def test_register():
    """Test user registration"""
    global test_email
    import time
    test_email = f"test{int(time.time())}@example.com"
    data = {
        "name": "Test User",
        "email": test_email,
        "password": "password123"
    }

    response = requests.post(f"{BASE_URL}/auth/register", json=data)
    print(f"Register Response: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print("✅ Registration successful!")
        print(f"User: {result['user']}")
        return result.get('access_token')
    else:
        print(f"❌ Registration failed: {response.text}")
        return None

def test_login():
    """Test user login"""
    global test_email

    data = {
        "username": test_email,
        "password": "password123"
    }

    response = requests.post(f"{BASE_URL}/auth/login", json=data)
    print(f"\nLogin Response: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print("✅ Login successful!")
        print(f"Token: {result.get('access_token')[:50]}...")
        return result.get('access_token')
    else:
        print(f"❌ Login failed: {response.text}")
        return None

def test_create_house(token):
    """Test house creation"""
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "name": "Test House",
        "description": "A test house for our flatmates"
    }

    response = requests.post(f"{BASE_URL}/houses/create", json=data, headers=headers)
    print(f"\nCreate House Response: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print("✅ House created successfully!")
        print(f"House: {result}")
        return result.get('id')
    else:
        print(f"❌ House creation failed: {response.text}")
        return None

def test_get_houses(token):
    """Test getting user houses"""
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(f"{BASE_URL}/houses/user", headers=headers)
    print(f"\nGet Houses Response: {response.status_code}")

    if response.status_code == 200:
        result = response.json()
        print("✅ Houses retrieved successfully!")
        print(f"Houses: {result}")
        return result
    else:
        print(f"❌ Get houses failed: {response.text}")
        return None

def main():
    print("🧪 Testing Flatmate API...")

    # Test registration
    token = test_register()
    if not token:
        print("❌ Cannot continue without registration token")
        return

    # Test login
    login_token = test_login()
    if login_token:
        token = login_token

    # Test house creation
    house_id = test_create_house(token)
    if house_id:
        # Test getting houses
        test_get_houses(token)

    print("\n🎉 API testing complete!")

if __name__ == "__main__":
    main()
