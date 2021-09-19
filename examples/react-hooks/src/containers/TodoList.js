import React, { useCallback, useMemo, useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import useRouter from "use-react-router";

import useInput from "../hooks/useInput";
import useOnEnter from "../hooks/useOnEnter";
import useTodos from "../reducers/useTodos";
import TodoItem from "./TodoItem";

export default function TodoList() {
  const router = useRouter();

  const doneColorSet = []
  doneColorSet[1] = 'done-last';
  doneColorSet[2] = 'done-second';
  doneColorSet[3] = 'done-third';

  const [completedToDoColor, setCompletedToDoColor] = useState([]); //list of last,2nd last and 3rd last completed 'todo' colors

  const [todos, { addTodo, deleteTodo, setDone }] = useTodos();

  const left = useMemo(() => todos.reduce((p, c) => p + (c.done ? 0 : 1), 0), [
    todos
  ]);

  const visibleTodos = useMemo(
    () =>
      router.match.params.filter
        ? todos.filter(i =>
            router.match.params.filter === "active" ? !i.done : i.done
          )
        : todos,
    [todos, router.match.params.filter]
  );

  const anyDone = useMemo(() => todos.some(i => i.done), [todos]);
  const allSelected = useMemo(() => visibleTodos.every(i => i.done), [
    visibleTodos
  ]);

  useEffect(() => {
    let sortedDoneToDos = [...todos];
    let doneColor = [];

    sortedDoneToDos = sortedDoneToDos.filter((a) => a.completedOn !== null) // removing non-completed todos
    sortedDoneToDos.sort((a,b) => new Date(b.completedOn) - new Date(a.completedOn)); // sorting in descending order them by date on which they are completed
    sortedDoneToDos = sortedDoneToDos.splice(0,3); // taking first 3 completed tasks

    sortedDoneToDos.map((ele,index) => (
      doneColor[ele.id] = doneColorSet[index + 1] //setting it's color
    ))
    setCompletedToDoColor(doneColor);
  },[todos])

  const onToggleAll = useCallback(
    () => {
      visibleTodos.forEach(i => setDone(i.id, !allSelected));
    },
    [visibleTodos, allSelected]
  );

  const onClearCompleted = useCallback(
    () => {
      todos.forEach(i => {
        if (i.done) {
          deleteTodo(i.id);
        }
      });
    },
    [todos]
  );

  const [newValue, onNewValueChange, setNewValue] = useInput();
  const onAddTodo = useOnEnter(
    () => {
      if (newValue) {
        addTodo(newValue);
        setNewValue("");
      }
    },
    [newValue]
  );

  return (
    <React.Fragment>
      <header className="header">
        <h1>todos</h1>
        <input
          className="new-todo"
          placeholder="What needs to be done?"
          onKeyPress={onAddTodo}
          value={newValue}
          onChange={onNewValueChange}
        />
      </header>

      <section className="main">
        <input
          id="toggle-all"
          type="checkbox"
          className="toggle-all"
          checked={allSelected}
          onChange={onToggleAll}
        />
        <label htmlFor="toggle-all" />
        <ul className="todo-list">
        {(visibleTodos.length > 0) &&
          <ul className='todo-header'>
            <li>&nbsp;</li>
            <li>Task</li>
            <li>Added On</li>
            <li>Completed On</li>
          </ul>
        }
          {visibleTodos.map(todo => (
            <TodoItem key={todo.id} todo={todo} doneColor={(completedToDoColor && completedToDoColor[todo.id]) ? completedToDoColor[todo.id] : null}/>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <span className="todo-count">
          <strong>{left}</strong> items left
        </span>
        <ul className="filters">
          <li>
            <NavLink exact={true} to="/" activeClassName="selected">
              All
            </NavLink>
          </li>
          <li>
            <NavLink to="/active" activeClassName="selected">
              Active
            </NavLink>
          </li>
          <li>
            <NavLink to="/completed" activeClassName="selected">
              Completed
            </NavLink>
          </li>
        </ul>
        {anyDone && (
          <button className="clear-completed" onClick={onClearCompleted}>
            Clear completed
          </button>
        )}
      </footer>
    </React.Fragment>
  );
}
