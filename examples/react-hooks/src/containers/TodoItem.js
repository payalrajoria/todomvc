import React, { useCallback, useEffect, useRef, useState } from "react";
import useOnClickOutside from "use-onclickoutside";

import useDoubleClick from "../hooks/useDoubleClick";
import useOnEnter from "../hooks/useOnEnter";
import useTodos from "../reducers/useTodos";

export default function TodoItem({ todo, doneColor }) {
  const [, { deleteTodo, setLabel, toggleDone }] = useTodos(() => null);

  const [editing, setEditing] = useState(false);

  const [newToDoColor, setNewToDoColor] = useState({})

  const onDelete = useCallback(() => deleteTodo(todo.id), [todo.id]);
  const onDone = useCallback(() => toggleDone(todo.id), [todo.id]);
  const onChange = useCallback(event => setLabel(todo.id, event.target.value), [
    todo.id
  ]);

  const handleViewClick = useDoubleClick(null, () => setEditing(true));
  const finishedCallback = useCallback(
    () => {
      setEditing(false);
      setLabel(todo.id, todo.label.trim());
    },
    [todo]
  );

  //checking the time of newly added 'todo' to set it's color to red and gradually change it to black in 15 seconds
  useEffect(() => {
    ((new Date()).getTime() - (new Date(todo.addedOn)).getTime()) / 1000 <= 15 && setNewToDoColor({color: 'red'});
    setTimeout(() => {
      ((new Date()).getTime() - (new Date(todo.addedOn)).getTime()) / 1000 <= 15 && setNewToDoColor({
        color: 'black', 
        transition: "all 15s ease",
        WebkitTransition: "all 15s ease",
        MozTransition: "all 15s ease"
      })
    }, 0);
  }, [todo])

  const onEnter = useOnEnter(finishedCallback, [todo]);
  const ref = useRef();
  useOnClickOutside(ref, finishedCallback);

  return (
    <li
      onClick={handleViewClick}
      className={`${editing ? "editing" : ""} ${todo.done ? "completed" : ""}`}
    >
      <div className="view">
        <input
          type="checkbox"
          className="toggle"
          checked={todo.done}
          onChange={onDone}
          autoFocus={true}
        />
        <label>
        <ul className={(doneColor) ? doneColor : 'done-default'} style={newToDoColor}>
          <li>{todo.label}</li>
          <li>{(new Date(todo.addedOn)).toLocaleString().replace('T', ' ').substr(0, 19)}</li>
          {(todo.completedOn) 
            ? <li>{(new Date(todo.completedOn)).toLocaleString().replace('T', ' ').substr(0, 19)}</li>
            : ''
          }
        </ul>
        </label>
        {/* <label>{todo.label} | {todo.addedOn} {(todo.completedOn) ? `|${todo.completedOn}` : ''} </label> */}
        <button className="destroy" onClick={onDelete} />
      </div>
      {editing && (
        <input
          ref={ref}
          className="edit"
          value={todo.label}
          onChange={onChange}
          onKeyPress={onEnter}
        />
      )}
    </li>
  );
}
