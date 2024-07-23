<script>
  let todo = "";
  const getTodos = async () => {
    const response = await fetch("/api/todos");
    return await response.json();
  };

  let todosPromise = getTodos();

  const addTodo = async () => {
    if (todo.length == 0) {
      return;
    }

    const newTodo = { todo };

    await fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify(newTodo),
    });

    todo = "";

    todosPromise = getTodos();
  };

  const deleteTodo = async (id) => {
    await fetch(`/api/todos/${id}`, {
      method: "DELETE",
    });
    todosPromise = getTodos();
  };
</script>

<h1>Todos</h1>

<input type="text" bind:value={todo} />
<button on:click={addTodo}>Add item</button>

{#await todosPromise}
  <p>Loading todos</p>
{:then todos}
  {#if todos.length == 0}
    <p>No todos available</p>
  {:else}
    <ul>
      {#each todos as todo}
        <li>
          {todo.item}
          <button on:click={() => deleteTodo(todo.id)}>delete</button>
        </li>
      {/each}
    </ul>
  {/if}
{/await}
