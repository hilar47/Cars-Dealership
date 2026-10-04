from .models import CarMake, CarModel

CAR_DATA = [
    {
        "name": "NISSAN",
        "description": "Great cars. Japanese technology",
        "models": [("Pathfinder", "SUV", 2023), ("Qashqai", "SUV", 2023), ("XTRAIL", "SUV", 2023)],
    },
    {
        "name": "Mercedes",
        "description": "Great cars. German technology",
        "models": [("A-Class", "SUV", 2023), ("C-Class", "SEDAN", 2023), ("E-Class", "SUV", 2023)],
    },
    {
        "name": "Audi",
        "description": "Great cars. German technology",
        "models": [("A4", "SEDAN", 2023), ("A5", "COUPE", 2023), ("A6", "SUV", 2023)],
    },
    {
        "name": "Kia",
        "description": "Great cars. Korean technology",
        "models": [("Sorrento", "SUV", 2023), ("Carnival", "WAGON", 2023), ("Cerato", "SEDAN", 2023)],
    },
    {
        "name": "Toyota",
        "description": "Great cars. Japanese technology",
        "models": [("Camry", "SEDAN", 2023), ("Corolla", "SEDAN", 2023), ("RAV4", "SUV", 2023)],
    },
    {
        "name": "Honda",
        "description": "Great cars. Japanese technology",
        "models": [("Civic", "SEDAN", 2023), ("CR-V", "SUV", 2023), ("Accord", "SEDAN", 2023)],
    },
    {
        "name": "Ford",
        "description": "Great cars. American technology",
        "models": [("F-150", "SUV", 2023), ("Mustang", "COUPE", 2023), ("Explorer", "SUV", 2023)],
    },
]


def initiate():
    """Create the default car makes and models (only when the tables are empty)."""
    if CarMake.objects.exists():
        return
    for make_data in CAR_DATA:
        make = CarMake.objects.create(name=make_data["name"], description=make_data["description"])
        for name, car_type, year in make_data["models"]:
            CarModel.objects.create(car_make=make, name=name, type=car_type, year=year)
