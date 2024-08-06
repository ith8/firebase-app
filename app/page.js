'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const fetchItems = async () => {
    const inventoryRef = query(collection(firestore, 'inventory'));
    const inventorySnapshot = await getDocs(inventoryRef);
    const inventoryList = inventorySnapshot.docs.map(doc => ({
      id: doc.id,
      quantity: doc.data().quantity,
    }));
    setItems(inventoryList);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async (itemName) => {
    const itemRef = doc(collection(firestore, 'inventory'), itemName);
    const itemSnapshot = await getDoc(itemRef);

    const newQuantity = itemSnapshot.exists() ? itemSnapshot.data().quantity + 1 : 1;
    await setDoc(itemRef, { quantity: newQuantity });

    setNewItemName('');
    setIsModalOpen(false);
    fetchItems();
  }

  const removeItem = async (itemId) => {
    const itemRef = doc(collection(firestore, 'inventory'), itemId);
    const itemSnapshot = await getDoc(itemRef);

    if (itemSnapshot.exists()) {
      const { quantity } = itemSnapshot.data();
      if (quantity === 1) {
        await deleteDoc(itemRef);
      } else {
        await setDoc(itemRef, { quantity: quantity - 1 });
      }
    }
    fetchItems();
  }

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
      gap={2}
    >
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(newItemName);
                closeModal();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={openModal}>
        Add New Item
      </Button>
      <Box border={'1px solid #333'}>
        <Box
          width="800px"
          height="100px"
          bgcolor={'#ADD8E6'}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
          {items.map(({ id, quantity }) => (
            <Box
              key={id}
              width="100%"
              minHeight="150px"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              bgcolor={'#f0f0f0'}
              paddingX={5}
            >
              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </Typography>
              <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
                Quantity: {quantity}
              </Typography>
              <Button variant="contained" onClick={() => removeItem(id)}>
                Remove
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
