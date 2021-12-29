package main

import (
	"fmt"
	"os"

	"mariogravel.com/unkrapuler/mp3"
)

func main() {
	fmt.Println("Hello Krap !")
	fmt.Println(os.Args[1])
	files, err := mp3.GetFiles(os.Args[1])
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	for k, file := range files {
		fmt.Printf("FILE #%04d: %v", k, file.String())
	}
	fmt.Println("Bye bye Krap !")
}
