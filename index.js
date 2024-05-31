const express = require('express');
const app = express();
app.use(express.json());

// Local variables to store data
let rooms = [];
let bookings = [];
let customers = [];

// Endpoint to create a room
app.post('/rooms', async (req, res) => {
    try {
        const { roomName, seatsAvailable, amenities, pricePerHour } = req.body;
        const roomId = rooms.length + 1;  // Generate a simple ID for the room
        const room = { roomId, roomName, seatsAvailable, amenities, pricePerHour };
        rooms.push(room);
        res.status(201).json({ message: 'Room created successfully', room });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to create a customer
app.post('/customers', async (req, res) => {
    try {
        const { customerName } = req.body;
        const customerId = customers.length + 1;  // Generate a simple ID for the customer
        const customer = { customerId, customerName };
        customers.push(customer);
        res.status(201).json({ message: 'Customer created successfully', customer });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to book a room
app.post('/bookings', async (req, res) => {
    try {
        console.log("Received Request Body:", req.body); // Log received request body for debugging
        
        const { customerId, date, startTime, endTime, roomId } = req.body;

        // Check if room ID and customer ID exist
        const roomExists = rooms.some(room => room.roomId === roomId);
        const customerExists = customers.some(customer => customer.customerId === customerId);

        console.log("Room Exists:", roomExists); // Log whether room exists for debugging
        console.log("Customer Exists:", customerExists); // Log whether customer exists for debugging

        if (!roomExists || !customerExists) {
            return res.status(400).json({ message: 'Invalid room ID or customer ID' });
        }

        // Check if the room is already booked for the given date and time
        const conflictingBooking = bookings.find(booking => booking.roomId === roomId && booking.date === date && (
            (booking.startTime <= startTime && booking.endTime > startTime) ||
            (booking.startTime < endTime && booking.endTime >= endTime) ||
            (booking.startTime >= startTime && booking.endTime <= endTime)
        ));

        if (conflictingBooking) {
            return res.status(400).json({ message: 'Room already booked for the given date and time' });
        }

        const bookingId = bookings.length + 1;  // Generate a simple ID for the booking
        const booking = { bookingId, customerId, date, startTime, endTime, roomId };
        bookings.push(booking);
        res.status(201).json({ message: 'Room booked successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to list all rooms with booked data
app.get('/rooms/bookings', async (req, res) => {
    try {
        const roomsWithBookings = rooms.map(room => {
            const bookedData = bookings
                .filter(booking => booking.roomId === room.roomId)
                .map(booking => {
                    const customer = customers.find(cust => cust.customerId === booking.customerId);
                    return { ...booking, customerName: customer.customerName };
                });
            
            const roomStatus = bookedData.length > 0 ? 'Booked' : 'Available';
            return { ...room, bookedData, roomStatus };
        });
        res.json(roomsWithBookings);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to list all customers with booked data
app.get('/customers/bookings', async (req, res) => {
    try {
        const customersWithBookings = customers.map(customer => {
            const bookedData = bookings
                .filter(booking => booking.customerId === customer.customerId)
                .map(booking => {
                    const room = rooms.find(room => room.roomId === booking.roomId);
                    return { ...booking, roomName: room.roomName };
                });
            return { ...customer, bookedData };
        });
        res.json(customersWithBookings);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Endpoint to list how many times a customer has booked the room
app.get('/customers/:customerId/bookings', async (req, res) => {
    try {
        const { customerId } = req.params;
        const customerBookings = bookings
            .filter(booking => booking.customerId == customerId)
            .map(booking => {
                const room = rooms.find(room => room.roomId === booking.roomId);
                return { 
                    customerName: customers.find(cust => cust.customerId == customerId).customerName,
                    roomName: room.roomName,
                    date: booking.date,
                    startTime: booking.startTime,
                    endTime: booking.endTime,
                    bookingId: booking.bookingId
                };
            });
        res.json(customerBookings);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

