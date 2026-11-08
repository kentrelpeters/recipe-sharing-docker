import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import App from '../App'

const recipe = {
  id: 1, name: 'Test Pasta', ingredients: 'Pasta\nTomatoes',
  instructions: 'Cook and serve.', cookTime: '20 minutes'
}
const response = data => Promise.resolve({ ok: true, json: async () => data })

beforeEach(() => {
  global.fetch = vi.fn()
})

it('renders recipes returned by the API', async () => {
  fetch.mockImplementation(() => response([recipe]))
  render(<App />)
  expect(await screen.findByText('Test Pasta')).toBeInTheDocument()
  expect(screen.getByText('All Recipes (1)')).toBeInTheDocument()
  expect(fetch).toHaveBeenCalledWith('http://localhost:5000/api/recipes')
})

it('submits the form and refreshes the recipe list', async () => {
  fetch.mockImplementationOnce(() => response([]))
    .mockImplementationOnce(() => response(recipe))
    .mockImplementation(() => response([recipe]))
  render(<App />)
  await screen.findByText(/No recipes yet/)
  fireEvent.change(screen.getByPlaceholderText('Recipe Name'), { target: { value: recipe.name } })
  fireEvent.change(screen.getByPlaceholderText('Cook Time (e.g., 30 minutes)'), { target: { value: recipe.cookTime } })
  fireEvent.change(screen.getByPlaceholderText('Ingredients (one per line)'), { target: { value: recipe.ingredients } })
  fireEvent.change(screen.getByPlaceholderText('Cooking Instructions'), { target: { value: recipe.instructions } })
  fireEvent.click(screen.getByRole('button', { name: 'Add Recipe' }))
  await waitFor(() => expect(fetch).toHaveBeenCalledWith(
    'http://localhost:5000/api/recipes',
    expect.objectContaining({ method: 'POST', body: JSON.stringify({
      name: recipe.name, ingredients: recipe.ingredients,
      instructions: recipe.instructions, cookTime: recipe.cookTime
    }) })
  ))
  expect(await screen.findByText('Test Pasta')).toBeInTheDocument()
  expect(screen.getByPlaceholderText('Recipe Name')).toHaveValue('')
})
