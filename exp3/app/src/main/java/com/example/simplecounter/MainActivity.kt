package com.example.simplecounterapp

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.widget.Button
import android.widget.TextView

class MainActivity : AppCompatActivity() {

    private var counter = 0  // variable to store count

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Linking UI elements with their IDs
        val tvCounter = findViewById<TextView>(R.id.tvCounter)
        val btnIncrement = findViewById<Button>(R.id.btnIncrement)
        val btnDecrement = findViewById<Button>(R.id.btnDecrement)
        val btnReset = findViewById<Button>(R.id.btnReset)

        // Initialize counter display
        tvCounter.text = counter.toString()

        // Increment Button Click
        btnIncrement.setOnClickListener {
            counter++
            tvCounter.text = counter.toString()
        }

        // Decrement Button Click
        btnDecrement.setOnClickListener {
            counter--
            tvCounter.text = counter.toString()
        }

        // Reset Button Click
        btnReset.setOnClickListener {
            counter = 0
            tvCounter.text = counter.toString()
        }
    }
}
