import pygame
import random

# Initialize Pygame
pygame.init()

# Set up the display
WIDTH = 800
HEIGHT = 400
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Robot Jump Game")

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)

# Robot properties
robot_width = 50
robot_height = 50
robot_x = 50
robot_y = HEIGHT - robot_height
robot_jump_speed = 10
robot_fall_speed = 0.5
is_jumping = False

# Obstacle properties
obstacle_width = 30
obstacle_height = 50
obstacle_x = WIDTH
obstacle_y = HEIGHT - obstacle_height
obstacle_speed = 5

# Game variables
score = 0
font = pygame.font.Font(None, 36)

clock = pygame.time.Clock()

def draw_robot(x, y):
    pygame.draw.rect(screen, RED, (x, y, robot_width, robot_height))

def draw_obstacle(x, y):
    pygame.draw.rect(screen, BLACK, (x, y, obstacle_width, obstacle_height))

# Game loop
running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE and not is_jumping:
                is_jumping = True

    # Jump logic
    if is_jumping:
        robot_y -= robot_jump_speed
        robot_jump_speed -= 1
        if robot_jump_speed < -10:
            is_jumping = False
            robot_jump_speed = 10
    else:
        if robot_y < HEIGHT - robot_height:
            robot_y += robot_fall_speed
        else:
            robot_y = HEIGHT - robot_height

    # Move and reset obstacle
    obstacle_x -= obstacle_speed
    if obstacle_x < -obstacle_width:
        obstacle_x = WIDTH
        score += 1

    # Collision detection
    if (robot_x < obstacle_x + obstacle_width and
        robot_x + robot_width > obstacle_x and
        robot_y < obstacle_y + obstacle_height and
        robot_y + robot_height > obstacle_y):
        running = False

    # Draw everything
    screen.fill(WHITE)
    draw_robot(robot_x, robot_y)
    draw_obstacle(obstacle_x, obstacle_y)

    # Draw score
    score_text = font.render(f"Score: {score}", True, BLACK)
    screen.blit(score_text, (10, 10))

    pygame.display.flip()
    clock.tick(60)

pygame.quit()