import React, { useState, useEffect } from 'react'
import { ref, push, onValue, update, remove, set } from 'firebase/database'
import { db } from '../firebase/config'
import styles from './SpaceBoard.module.css'

const COLUMNS = [
  { id: 'todo', label: 'To Do', emoji: '📝' },
  { id: 'progress', label: 'In Progress', emoji: '⏳' },
  { id: 'done', label: 'Done', emoji: '✅' }
]

export default function SpaceBoard({ uid }) {
  const [spaces, setSpaces] = useState([])
  const [activeSpaceId, setActiveSpaceId] = useState(null)
  const [tasks, setTasks] = useState([])
  const [draggedOverCol, setDraggedOverCol] = useState(null)
  
  // Modal states
  const [selectedTask, setSelectedTask] = useState(null) // null = closed, 'new' = creating new, object = editing existing
  const [modalForm, setModalForm] = useState({ title: '', desc: '', status: 'todo' })
  const [modalChecks, setModalChecks] = useState([])
  const [newCheckText, setNewCheckText] = useState('')

  // 1. Fetch Spaces
  useEffect(() => {
    if (!uid) return
    const unsub = onValue(ref(db, `users/${uid}/spaces`), snap => {
      const data = snap.val() || {}
      const arr = Object.entries(data).map(([id, val]) => ({ id, ...val })).sort((a,b) => a.createdAt - b.createdAt)
      setSpaces(arr)
      if (arr.length > 0 && !activeSpaceId) setActiveSpaceId(arr[0].id)
      else if (arr.length === 0) setActiveSpaceId(null)
    })
    return () => unsub()
  }, [uid])

  // 2. Fetch Tasks for Active Space
  useEffect(() => {
    if (!uid || !activeSpaceId) {
      setTasks([])
      return
    }
    const unsub = onValue(ref(db, `users/${uid}/space_tasks/${activeSpaceId}`), snap => {
      const data = snap.val() || {}
      setTasks(Object.entries(data).map(([id, val]) => ({ id, ...val })))
    })
    return () => unsub()
  }, [uid, activeSpaceId])

  // --- Spaces Management ---
  const addSpace = () => {
    const name = prompt("Enter new space name (e.g. Studying, Groceries):")
    if (!name || !name.trim()) return
    const id = `sp_${Date.now()}`
    set(ref(db, `users/${uid}/spaces/${id}`), { name: name.trim(), emoji: '📁', createdAt: Date.now() })
    setActiveSpaceId(id)
  }

  const deleteSpace = () => {
    if (!activeSpaceId) return
    if (confirm("Are you sure you want to delete this entire space and all its tasks?")) {
      remove(ref(db, `users/${uid}/spaces/${activeSpaceId}`))
      remove(ref(db, `users/${uid}/space_tasks/${activeSpaceId}`))
      setActiveSpaceId(null)
    }
  }

  // --- Drag & Drop ---
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId)
    // Small timeout to allow the native drag image to capture before we might visually hide the original if we wanted to
  }

  const handleDragOver = (e, colId) => {
    e.preventDefault() // Necessary to allow dropping
    setDraggedOverCol(colId)
  }

  const handleDragLeave = () => {
    setDraggedOverCol(null)
  }

  const handleDrop = async (e, colId) => {
    e.preventDefault()
    setDraggedOverCol(null)
    const taskId = e.dataTransfer.getData('taskId')
    if (!taskId) return
    
    // Optimistic UI could be done here, but Firebase Realtime DB is fast enough.
    await update(ref(db, `users/${uid}/space_tasks/${activeSpaceId}/${taskId}`), {
      status: colId,
      updatedAt: Date.now()
    })
  }

  // --- Modal Management ---
  const openNewTaskModal = () => {
    setModalForm({ title: '', desc: '', status: 'todo' })
    setModalChecks([])
    setSelectedTask('new')
  }

  const openEditModal = (task) => {
    setModalForm({ title: task.title, desc: task.desc || '', status: task.status })
    setModalChecks(task.checks || [])
    setSelectedTask(task)
  }

  const saveModal = async () => {
    if (!modalForm.title.trim()) return alert("Title is required")
    
    const taskData = {
      title: modalForm.title.trim(),
      desc: modalForm.desc.trim(),
      status: modalForm.status,
      checks: modalChecks,
      updatedAt: Date.now()
    }

    if (selectedTask === 'new') {
      taskData.createdAt = Date.now()
      await push(ref(db, `users/${uid}/space_tasks/${activeSpaceId}`), taskData)
    } else {
      await update(ref(db, `users/${uid}/space_tasks/${activeSpaceId}/${selectedTask.id}`), taskData)
    }
    
    setSelectedTask(null)
  }

  const deleteModalTask = async () => {
    if (confirm("Delete this task forever?")) {
      await remove(ref(db, `users/${uid}/space_tasks/${activeSpaceId}/${selectedTask.id}`))
      setSelectedTask(null)
    }
  }

  // Checklist mgmt inside modal
  const addCheck = () => {
    if (!newCheckText.trim()) return
    setModalChecks([...modalChecks, { id: Date.now().toString(), text: newCheckText.trim(), done: false }])
    setNewCheckText('')
  }
  
  const toggleCheck = (idx) => {
    const updated = [...modalChecks]
    updated[idx].done = !updated[idx].done
    setModalChecks(updated)
  }
  
  const removeCheck = (idx) => {
    const updated = [...modalChecks]
    updated.splice(idx, 1)
    setModalChecks(updated)
  }

  // Quick checkbox toggle without opening modal
  const quickToggleCheck = async (e, task, cId) => {
    e.stopPropagation() // Don't open modal
    const checks = [...(task.checks||[])]
    const checkIdx = checks.findIndex(c => c.id === cId)
    if (checkIdx > -1) {
      checks[checkIdx].done = !checks[checkIdx].done
      await update(ref(db, `users/${uid}/space_tasks/${activeSpaceId}/${task.id}`), { checks })
    }
  }

  const activeSpace = spaces.find(s => s.id === activeSpaceId)

  return (
    <div className={styles.container}>
      {/* 1. Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span>Your Spaces</span>
          <button className={styles.addSpaceBtn} onClick={addSpace} title="New Space">+</button>
        </div>
        <div className={styles.spacesList}>
          {spaces.length === 0 && <div className={styles.emptySpaces}>No spaces yet.<br/>Click + to add "Studying" or "Groceries"!</div>}
          {spaces.map(s => (
            <div 
              key={s.id} 
              className={`${styles.spaceItem} ${activeSpaceId === s.id ? styles.spaceActive : ''}`}
              onClick={() => setActiveSpaceId(s.id)}
            >
              <span>{s.emoji}</span>
              <span>{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Board Area */}
      <div className={styles.boardArea}>
        {activeSpace ? (
          <>
            <div className={styles.boardHeader}>
              <div className={styles.boardTitle}>
                {activeSpace.emoji} {activeSpace.name}
              </div>
              <div style={{display:'flex', gap:'12px'}}>
                <button className={styles.deleteSpaceBtn} onClick={deleteSpace}>✕ Delete Space</button>
                <button className={styles.addTaskBtn} onClick={openNewTaskModal}>+ Add Task</button>
              </div>
            </div>

            <div className={styles.boardCols}>
              {COLUMNS.map(col => {
                const colTasks = tasks.filter(t => t.status === col.id).sort((a,b) => b.createdAt - a.createdAt)
                return (
                  <div 
                    key={col.id} 
                    className={`${styles.column} ${draggedOverCol === col.id ? styles.columnDragOver : ''}`}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, col.id)}
                  >
                    <div className={styles.colHeader}>
                      <span>{col.emoji} {col.label}</span>
                      <span className={styles.colCount}>{colTasks.length}</span>
                    </div>

                    <div className={styles.taskList}>
                      {colTasks.length === 0 && (
                         <div style={{color:'var(--text-soft)', fontSize:'0.85rem', textAlign:'center', marginTop:'20px', border:'1px dashed var(--border)', padding:'20px', borderRadius:'8px'}}>
                           Drop tasks here
                         </div>
                      )}
                      {colTasks.map(task => {
                        const allChecks = task.checks || []
                        const doneCount = allChecks.filter(c => c.done).length
                        
                        return (
                          <div 
                            key={task.id} 
                            className={styles.taskCard}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            onClick={() => openEditModal(task)}
                          >
                            <div className={styles.taskTitle}>{task.title}</div>
                            
                            {/* Render up to 3 quick checkboxes right on the card for quick checking */}
                            {allChecks.slice(0, 3).map(c => (
                               <div key={c.id} style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'6px'}} onClick={e => quickToggleCheck(e, task, c.id)}>
                                 <div className={`${styles.checkBox} ${c.done ? styles.checkBoxDone : ''}`} style={{width:14, height:14, borderRadius:3}}>
                                   {c.done && <svg viewBox="0 0 24 24" fill="white" width="10" height="10"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>}
                                 </div>
                                 <span style={{fontSize:'0.8rem', color: c.done ? 'var(--text-soft)' : 'var(--text-dark)', textDecoration: c.done ? 'line-through' : 'none'}}>{c.text}</span>
                               </div>
                            ))}
                            {allChecks.length > 3 && <div style={{fontSize:'0.75rem', color:'var(--text-soft)', marginTop:'4px'}}>+ {allChecks.length - 3} more...</div>}

                            {allChecks.length > 0 && (
                              <div className={styles.taskMeta}>
                                <div className={styles.taskChecks}>
                                  <span>{doneCount}/{allChecks.length}</span>
                                </div>
                                {doneCount === allChecks.length && <span style={{color:'var(--amber)', fontSize:'0.85rem'}}>🎉 Completed</span>}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <div style={{display:'flex', flex:1, alignItems:'center', justifyContent:'center', color:'var(--text-soft)', flexDirection:'column', gap:'12px'}}>
             <div style={{fontSize:'3rem'}}>📋</div>
             <h3>Select or create a space to start organizing.</h3>
          </div>
        )}
      </div>

      {/* 3. Task Edit Modal */}
      {selectedTask && (
        <div className={styles.modalOverlay} onClick={() => setSelectedTask(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{selectedTask === 'new' ? 'Create Task' : 'Edit Task'}</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedTask(null)}>✕</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>Task Title</label>
                <input 
                  className={styles.input} 
                  autoFocus
                  placeholder="e.g. Finish math homework" 
                  value={modalForm.title} 
                  onChange={e => setModalForm({...modalForm, title: e.target.value})} 
                />
              </div>
              
              <div className={styles.field}>
                <label>Description (Optional)</label>
                <textarea 
                  className={styles.textarea} 
                  placeholder="Add details, links, or notes..." 
                  value={modalForm.desc} 
                  onChange={e => setModalForm({...modalForm, desc: e.target.value})} 
                />
              </div>

              <div className={styles.field}>
                <label>Checklist / Subtasks</label>
                <div>
                  {modalChecks.map((c, i) => (
                    <div key={i} className={styles.checkItem}>
                       <div className={`${styles.checkBox} ${c.done ? styles.checkBoxDone : ''}`} onClick={() => toggleCheck(i)}>
                         {c.done && <svg viewBox="0 0 24 24" fill="white" width="12" height="12"><path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"/></svg>}
                       </div>
                       <div className={`${styles.checkText} ${c.done ? styles.checkTextDone : ''}`}>{c.text}</div>
                       <button className={styles.delCheckBtn} onClick={() => removeCheck(i)}>✕</button>
                    </div>
                  ))}
                  <div className={styles.addCheckRow}>
                    <input 
                      className={styles.input} 
                      placeholder="Add an item..." 
                      value={newCheckText} 
                      onChange={e => setNewCheckText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addCheck()}
                    />
                    <button className={styles.addCheckBtn} onClick={addCheck}>Add</button>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
               {selectedTask !== 'new' ? (
                 <button className={styles.btnDel} onClick={deleteModalTask}>Delete Task</button>
               ) : <div/>}
               <button className={styles.btnSave} onClick={saveModal}>Save Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
