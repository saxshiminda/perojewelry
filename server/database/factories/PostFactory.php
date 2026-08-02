<?php

namespace Database\Factories;

use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => fake()->sentence(),
            'excerpt' => fake()->paragraph(2),
            'content' => fake()->paragraphs(5, true),
            'image_url' => 'assets/images/blog-' . fake()->numberBetween(1, 4) . '.png',
            'category' => fake()->randomElement(['Craft & Process', 'Materials', 'Styling', 'Behind the Scenes', 'Drops']),
            'published' => true,
        ];
    }
}
